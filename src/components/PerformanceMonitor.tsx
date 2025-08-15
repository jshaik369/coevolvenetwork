import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  sessionId: string;
  timestamp: number;
  pageLoad: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
  };
  navigation: {
    type: string;
    redirectCount: number;
    transferSize: number;
  };
  resources: Array<{
    name: string;
    type: string;
    duration: number;
    size: number;
  }>;
  errors: Array<{
    message: string;
    filename: string;
    lineno: number;
    colno: number;
    timestamp: number;
  }>;
  vitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
}

interface PerformanceMonitorProps {
  sessionId: string;
  enabled?: boolean;
}

const PerformanceMonitor = ({ sessionId, enabled = true }: PerformanceMonitorProps) => {
  const metricsData = useRef<PerformanceMetrics>({
    sessionId,
    timestamp: Date.now(),
    pageLoad: {
      domContentLoaded: 0,
      loadComplete: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    },
    navigation: {
      type: 'unknown',
      redirectCount: 0,
      transferSize: 0,
    },
    resources: [],
    errors: [],
    vitals: {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
    }
  });

  useEffect(() => {
    if (!enabled) return;

    // Collect basic performance timing
    const collectBasicMetrics = () => {
      const perfTiming = performance.timing;
      const navigation = performance.navigation;
      
      metricsData.current.pageLoad = {
        domContentLoaded: perfTiming.domContentLoadedEventEnd - perfTiming.navigationStart,
        loadComplete: perfTiming.loadEventEnd - perfTiming.navigationStart,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
      };

      metricsData.current.navigation = {
        type: navigation.type === 0 ? 'navigate' : navigation.type === 1 ? 'reload' : 'back_forward',
        redirectCount: navigation.redirectCount,
        transferSize: 0,
      };
    };

    // Collect Core Web Vitals using Performance Observer
    const collectWebVitals = () => {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            metricsData.current.vitals.lcp = lastEntry.startTime;
            metricsData.current.pageLoad.largestContentfulPaint = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Contentful Paint (FCP)
          const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            for (const entry of entries) {
              if (entry.name === 'first-contentful-paint') {
                metricsData.current.vitals.fcp = entry.startTime;
                metricsData.current.pageLoad.firstContentfulPaint = entry.startTime;
              }
            }
          });
          fcpObserver.observe({ entryTypes: ['paint'] });

          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
                metricsData.current.vitals.cls = clsValue;
                metricsData.current.pageLoad.cumulativeLayoutShift = clsValue;
              }
            }
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          // First Input Delay (FID)
          const fidObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              const fid = (entry as any).processingStart - entry.startTime;
              metricsData.current.vitals.fid = fid;
              metricsData.current.pageLoad.firstInputDelay = fid;
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

        } catch (error) {
          console.warn('Performance Observer not fully supported:', error);
        }
      }
    };

    // Collect resource performance data
    const collectResourceMetrics = () => {
      const resources = performance.getEntriesByType('resource');
      metricsData.current.resources = resources.map((resource: any) => ({
        name: resource.name,
        type: resource.initiatorType,
        duration: resource.duration,
        size: resource.transferSize || 0,
      }));
    };

    // Error tracking
    const trackErrors = () => {
      window.addEventListener('error', (event) => {
        metricsData.current.errors.push({
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: Date.now(),
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        metricsData.current.errors.push({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          filename: 'unknown',
          lineno: 0,
          colno: 0,
          timestamp: Date.now(),
        });
      });
    };

    // Initialize metrics collection
    if (document.readyState === 'complete') {
      collectBasicMetrics();
      collectResourceMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          collectBasicMetrics();
          collectResourceMetrics();
        }, 100);
      });
    }

    collectWebVitals();
    trackErrors();

    // Send metrics periodically
    const metricsInterval = setInterval(sendMetrics, 30000);

    // Send metrics on page unload
    const handleBeforeUnload = () => {
      sendMetrics(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(metricsInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, sessionId]);

  const sendMetrics = async (isBeforeUnload = false) => {
    try {
      const metricsToSend = {
        ...metricsData.current,
        timestamp: Date.now(),
        isBeforeUnload
      };

      if (isBeforeUnload && navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance', JSON.stringify(metricsToSend));
      } else {
        await supabase.functions.invoke('performance-metrics', {
          body: metricsToSend,
        });
      }
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  };

  // Expose performance API for other components
  useEffect(() => {
    // @ts-ignore
    window.coEvolvePerformance = {
      getMetrics: () => metricsData.current,
      sendMetrics,
      trackCustomMetric: (name: string, value: number) => {
        // Add custom performance tracking
        performance.mark(`custom-${name}`);
        performance.measure(name, `custom-${name}`);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
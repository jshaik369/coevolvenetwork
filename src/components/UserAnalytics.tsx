import { useEffect, useRef } from 'react';

interface UserBehaviorData {
  sessionId: string;
  timestamp: number;
  userAgent: string;
  viewport: { width: number; height: number };
  location: { country?: string; city?: string };
  interactions: {
    clicks: Array<{ element: string; timestamp: number; coordinates: [number, number] }>;
    scrollDepth: number;
    timeOnPage: number;
    mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  };
  collaboration: {
    preferredWorkingHours: number[];
    communicationStyle: 'direct' | 'collaborative' | 'analytical' | 'expressive';
    projectTypes: string[];
    skillLevel: 'beginner' | 'intermediate' | 'expert';
  };
  culturalData: {
    language: string;
    timezone: string;
    deviceType: 'mobile' | 'desktop' | 'tablet';
    networkType: 'wifi' | 'cellular' | 'unknown';
  };
}

interface UserAnalyticsProps {
  userId?: string;
  collectAdvancedMetrics?: boolean;
}

const UserAnalytics = ({ userId, collectAdvancedMetrics = true }: UserAnalyticsProps) => {
  const sessionData = useRef<UserBehaviorData>({
    sessionId: crypto.randomUUID(),
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    viewport: { 
      width: window.innerWidth, 
      height: window.innerHeight 
    },
    location: {},
    interactions: {
      clicks: [],
      scrollDepth: 0,
      timeOnPage: 0,
      mouseMovements: []
    },
    collaboration: {
      preferredWorkingHours: [],
      communicationStyle: 'collaborative',
      projectTypes: [],
      skillLevel: 'intermediate'
    },
    culturalData: {
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      networkType: 'unknown'
    }
  });

  const mouseMovements = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!collectAdvancedMetrics) return;

    // Track mouse movements (throttled)
    let lastMouseTime = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseTime > 100) { // Throttle to every 100ms
        mouseMovements.current.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: now
        });
        lastMouseTime = now;
        
        // Keep only last 100 movements to prevent memory issues
        if (mouseMovements.current.length > 100) {
          mouseMovements.current = mouseMovements.current.slice(-50);
        }
      }
    };

    // Track clicks with detailed context
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementInfo = {
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        textContent: target.textContent?.slice(0, 50) || ''
      };

      sessionData.current.interactions.clicks.push({
        element: `${elementInfo.tagName}.${elementInfo.className}#${elementInfo.id}`,
        timestamp: Date.now(),
        coordinates: [e.clientX, e.clientY]
      });
    };

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
      
      sessionData.current.interactions.scrollDepth = Math.max(
        sessionData.current.interactions.scrollDepth,
        scrollDepth
      );
    };

    // Track time on page
    const updateTimeOnPage = () => {
      sessionData.current.interactions.timeOnPage = Date.now() - startTime.current;
    };

    // Detect network type if possible
    const updateNetworkInfo = () => {
      // @ts-ignore - navigator.connection is experimental
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        sessionData.current.culturalData.networkType = 
          connection.effectiveType === '4g' ? 'wifi' : 'cellular';
      }
    };

    // Get location data (with user consent)
    const getLocationData = async () => {
      try {
        // Use IP-based geolocation for basic country/city info
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        sessionData.current.location = {
          country: data.country_name,
          city: data.city
        };
      } catch (error) {
        console.warn('Unable to get location data:', error);
      }
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll);
    
    // Initialize data collection
    updateNetworkInfo();
    getLocationData();
    
    const timeInterval = setInterval(updateTimeOnPage, 5000); // Update every 5 seconds

    // Send data to backend every 30 seconds
    const dataInterval = setInterval(() => {
      sendAnalyticsData();
    }, 30000);

    // Send data on page unload
    const handleBeforeUnload = () => {
      updateTimeOnPage();
      sessionData.current.interactions.mouseMovements = mouseMovements.current;
      sendAnalyticsData(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(timeInterval);
      clearInterval(dataInterval);
    };
  }, [collectAdvancedMetrics]);

  const sendAnalyticsData = async (isBeforeUnload = false) => {
    try {
      const dataToSend = {
        ...sessionData.current,
        interactions: {
          ...sessionData.current.interactions,
          mouseMovements: mouseMovements.current,
          timeOnPage: Date.now() - startTime.current
        },
        userId,
        isBeforeUnload
      };

      // Use sendBeacon for unload events, fetch for regular intervals
      if (isBeforeUnload && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(dataToSend));
      } else {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics data:', error);
    }
  };

  // Expose analytics API for other components
  const updateCollaborationData = (data: Partial<UserBehaviorData['collaboration']>) => {
    sessionData.current.collaboration = {
      ...sessionData.current.collaboration,
      ...data
    };
  };

  const trackCustomEvent = (eventName: string, eventData: any) => {
    sessionData.current.interactions.clicks.push({
      element: `custom_event:${eventName}`,
      timestamp: Date.now(),
      coordinates: [0, 0]
    });
  };

  // Store analytics functions globally for other components to use
  useEffect(() => {
    // @ts-ignore
    window.coEvolveAnalytics = {
      updateCollaborationData,
      trackCustomEvent,
      sendAnalyticsData
    };
  }, []);

  return null; // This component doesn't render anything
};

export default UserAnalytics;

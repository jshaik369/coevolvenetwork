import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface CobeGlobeProps {
  className?: string;
}

const CobeGlobe = ({ className }: CobeGlobeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let height = 0;
    
    const onResize = () => {
      if (canvasRef.current && canvasRef.current.offsetParent) {
        width = canvasRef.current.offsetWidth;
        height = canvasRef.current.offsetHeight;
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    if (canvasRef.current && width > 0 && height > 0) {
      globeRef.current = createGlobe(canvasRef.current, {
        devicePixelRatio: Math.min(window.devicePixelRatio, 2),
        width: width * 2,
        height: height * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 8.0,
        mapSamples: 32000,
        mapBrightness: 35,
        baseColor: [0.05, 0.1, 0.3],
        markerColor: [0.1, 1, 0.1],
        glowColor: [0.1, 1, 0.1],
        offset: [0, 0],
        scale: 1,
        opacity: 1,
        markers: [
          // Primary Hubs (Yellow/Green)
          { location: [41.3851, 2.1734], size: 0.07 }, // Barcelona - Primary Launch Hub
          { location: [12.9716, 77.5946], size: 0.06 }, // Bangalore - Primary Launch Hub

          // Established AI Hubs (Yellow markers)
          { location: [37.7749, -122.4194], size: 0.05 }, // San Francisco
          { location: [40.7128, -74.0060], size: 0.05 }, // New York
          { location: [51.5074, -0.1278], size: 0.05 }, // London
          { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
          { location: [43.6532, -79.3832], size: 0.04 }, // Toronto
          { location: [32.0853, 34.7818], size: 0.04 }, // Tel Aviv
          { location: [59.3293, 18.0686], size: 0.04 }, // Stockholm
          { location: [48.8566, 2.3522], size: 0.04 }, // Paris
          { location: [39.9042, 116.4074], size: 0.04 }, // Beijing
          { location: [45.5017, -73.5673], size: 0.04 }, // Montreal
          { location: [49.2827, -123.1207], size: 0.04 }, // Vancouver

          // Secondary AI Hubs
          { location: [1.3521, 103.8198], size: 0.04 }, // Singapore
          { location: [52.5200, 13.4050], size: 0.04 }, // Berlin
          { location: [19.0760, 72.8777], size: 0.04 }, // Mumbai
          { location: [28.7041, 77.1025], size: 0.04 }, // Delhi

          // Emerging AI Hubs (Red markers via markerColor variation)
          { location: [30.2672, -97.7431], size: 0.03 }, // Austin
          { location: [25.2048, 55.2708], size: 0.03 }, // Dubai
          { location: [52.3676, 4.9041], size: 0.03 }, // Amsterdam
          { location: [37.5665, 126.9780], size: 0.03 }, // Seoul
          { location: [22.3193, 114.1694], size: 0.03 }, // Shenzhen
          { location: [-33.8688, 151.2093], size: 0.03 }, // Sydney
          { location: [55.7558, 37.6176], size: 0.03 }, // Moscow
          { location: [47.6062, -122.3321], size: 0.03 }, // Seattle
          { location: [34.0522, -118.2437], size: 0.03 }, // Los Angeles
          { location: [-23.5505, -46.6333], size: 0.03 }, // São Paulo
        ],
        onRender: (state) => {
          // Smooth rotation
          phi += 0.003;
          state.phi = phi;

          // Enhanced day/night cycle with realistic lighting
          const time = Date.now() * 0.00005;
          const dayNightCycle = Math.sin(time);

          // Maximum intensity heartbeat pulse animation
          const heartbeatPulse = Math.sin(Date.now() * 0.01) * 0.5 + 0.5; // 0 to 1
          const flashIntensity = 1.0 + heartbeatPulse * 2.0; // 1.0 to 3.0 - dramatic flash

          // Maximum diffusion and brightness with intense flash
          state.diffuse = (8.0 + dayNightCycle * 2.0) * flashIntensity;
          state.mapBrightness = (35 + dayNightCycle * 15) * flashIntensity;

          // Maximum atmospheric glow
          const atmosphere = 1.0;
          state.opacity = atmosphere;
        }
      });
    }

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
      }
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        aspectRatio: '1',
      }}
    />
  );
};

export default CobeGlobe;
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
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.3, 0.3, 0.3],
        markerColor: [0.1, 1, 0.5],
        glowColor: [1, 1, 1],
        markers: [
          // Global community hubs
          { location: [41.3851, 2.1734], size: 0.07 }, // Barcelona
          { location: [12.9716, 77.5946], size: 0.06 }, // Bangalore
          { location: [37.7749, -122.4194], size: 0.05 }, // San Francisco
          { location: [40.7128, -74.0060], size: 0.05 }, // New York
          { location: [51.5074, -0.1278], size: 0.05 }, // London
          { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
          { location: [1.3521, 103.8198], size: 0.04 }, // Singapore
          { location: [52.5200, 13.4050], size: 0.04 }, // Berlin
          { location: [19.0760, 72.8777], size: 0.04 }, // Mumbai
          { location: [28.7041, 77.1025], size: 0.04 }, // Delhi
        ],
        onRender: (state) => {
          // Smooth rotation
          phi += 0.003;
          state.phi = phi;
          
          // Enhanced day/night cycle with realistic lighting
          const time = Date.now() * 0.00005;
          const dayNightCycle = Math.sin(time);
          
          // Dynamic diffusion for day/night effect
          state.diffuse = 1.2 + dayNightCycle * 0.8;
          state.mapBrightness = 3 + dayNightCycle * 3;
          
          // Subtle atmospheric glow
          const atmosphere = 0.8 + Math.sin(time * 1.5) * 0.2;
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
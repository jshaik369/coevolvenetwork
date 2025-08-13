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
    
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    if (canvasRef.current) {
      globeRef.current = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 3,
        mapSamples: 16000,
        mapBrightness: 1.2,
        baseColor: [1, 1, 1],
        markerColor: [251 / 255, 100 / 255, 21 / 255],
        glowColor: [1, 1, 1],
        markers: [
          // Major tech hubs
          { location: [37.7749, -122.4194], size: 0.03 }, // San Francisco
          { location: [40.7128, -74.0060], size: 0.1 }, // New York
          { location: [51.5074, -0.1278], size: 0.05 }, // London
          { location: [35.6762, 139.6503], size: 0.07 }, // Tokyo
          { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
          { location: [52.5200, 13.4050], size: 0.04 }, // Berlin
          { location: [37.5665, 126.9780], size: 0.04 }, // Seoul
        ],
        onRender: (state) => {
          // Auto-rotation
          phi += 0.005;
          state.phi = phi;
          
          // Simulate day/night cycle
          const time = Date.now() * 0.0001;
          state.diffuse = 1.2 + Math.sin(time) * 0.5;
          state.mapBrightness = 0.8 + Math.sin(time * 0.5) * 0.4;
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
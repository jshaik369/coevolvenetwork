import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

interface ClickData {
  element: string;
  coordinates: [number, number];
  timestamp: number;
}

interface HeatmapVisualizationProps {
  className?: string;
}

const HeatmapVisualization = ({ className }: HeatmapVisualizationProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [clickData, setClickData] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClicks, setShowClicks] = useState(true);
  const [showMovements, setShowMovements] = useState(true);
  const [intensity, setIntensity] = useState([50]);
  const [radius, setRadius] = useState([25]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  useEffect(() => {
    if (heatmapData.length > 0 || clickData.length > 0) {
      renderHeatmap();
    }
  }, [heatmapData, clickData, showClicks, showMovements, intensity, radius]);

  const fetchHeatmapData = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('interactions')
        .not('interactions', 'is', null);

      if (error) throw error;

      const allMouseMovements: HeatmapPoint[] = [];
      const allClicks: ClickData[] = [];

      data?.forEach((session) => {
        // Process mouse movements
        if ((session.interactions as any)?.mouseMovements) {
          (session.interactions as any).mouseMovements.forEach((movement: any) => {
            allMouseMovements.push({
              x: movement.x,
              y: movement.y,
              intensity: 1
            });
          });
        }

        // Process clicks
        if ((session.interactions as any)?.clicks) {
          (session.interactions as any).clicks.forEach((click: any) => {
            allClicks.push({
              element: click.element,
              coordinates: click.coordinates,
              timestamp: click.timestamp
            });
          });
        }
      });

      // Aggregate mouse movements by proximity
      const aggregatedData = aggregateMouseMovements(allMouseMovements);
      setHeatmapData(aggregatedData);
      setClickData(allClicks);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const aggregateMouseMovements = (movements: HeatmapPoint[]): HeatmapPoint[] => {
    const gridSize = 20;
    const grid: { [key: string]: { count: number; x: number; y: number } } = {};

    movements.forEach((point) => {
      const gridX = Math.floor(point.x / gridSize);
      const gridY = Math.floor(point.y / gridSize);
      const key = `${gridX},${gridY}`;

      if (!grid[key]) {
        grid[key] = { count: 0, x: gridX * gridSize, y: gridY * gridSize };
      }
      grid[key].count += 1;
    });

    return Object.values(grid).map((cell) => ({
      x: cell.x,
      y: cell.y,
      intensity: Math.min(cell.count / 10, 1) // Normalize intensity
    }));
  };

  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match common viewport
    canvas.width = 1200;
    canvas.height = 800;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw mouse movement heatmap
    if (showMovements && heatmapData.length > 0) {
      heatmapData.forEach((point) => {
        const adjustedIntensity = (point.intensity * intensity[0]) / 100;
        const adjustedRadius = radius[0];

        // Create radial gradient
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, adjustedRadius
        );

        gradient.addColorStop(0, `rgba(255, 0, 0, ${adjustedIntensity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${adjustedIntensity * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(
          point.x - adjustedRadius,
          point.y - adjustedRadius,
          adjustedRadius * 2,
          adjustedRadius * 2
        );
      });
    }

    // Draw click points
    if (showClicks && clickData.length > 0) {
      clickData.forEach((click) => {
        const [x, y] = click.coordinates;
        
        // Draw click circle
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 100, 255, 0.8)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw click number
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('•', x, y + 3);
      });
    }
  };

  const generateReport = () => {
    const report = {
      totalClicks: clickData.length,
      totalMovements: heatmapData.reduce((sum, point) => sum + point.intensity, 0),
      mostClickedElements: getMostClickedElements(),
      hotspots: getHotspots(),
      generatedAt: new Date().toISOString()
    };

    console.log('Heatmap Report:', report);
    // You could save this to database or export as file
  };

  const getMostClickedElements = () => {
    const elementCounts: { [key: string]: number } = {};
    
    clickData.forEach((click) => {
      elementCounts[click.element] = (elementCounts[click.element] || 0) + 1;
    });

    return Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([element, count]) => ({ element, count }));
  };

  const getHotspots = () => {
    return heatmapData
      .filter(point => point.intensity > 0.5)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 10)
      .map(point => ({
        x: Math.round(point.x),
        y: Math.round(point.y),
        intensity: Math.round(point.intensity * 100)
      }));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Heatmap Visualization</CardTitle>
          <CardDescription>Loading user interaction data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>User Interaction Heatmap</CardTitle>
        <CardDescription>
          Visual representation of mouse movements and clicks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-movements"
              checked={showMovements}
              onCheckedChange={setShowMovements}
            />
            <Label htmlFor="show-movements">Mouse Movements</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-clicks"
              checked={showClicks}
              onCheckedChange={setShowClicks}
            />
            <Label htmlFor="show-clicks">Click Points</Label>
          </div>

          <div className="space-y-2">
            <Label>Intensity: {intensity[0]}%</Label>
            <Slider
              value={intensity}
              onValueChange={setIntensity}
              min={10}
              max={100}
              step={10}
            />
          </div>

          <div className="space-y-2">
            <Label>Radius: {radius[0]}px</Label>
            <Slider
              value={radius}
              onValueChange={setRadius}
              min={10}
              max={50}
              step={5}
            />
          </div>
        </div>

        {/* Canvas */}
        <div className="border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[600px] object-contain"
            style={{ background: 'rgba(0, 0, 0, 0.05)' }}
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{clickData.length}</div>
            <div className="text-sm text-muted-foreground">Total Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{heatmapData.length}</div>
            <div className="text-sm text-muted-foreground">Movement Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{getHotspots().length}</div>
            <div className="text-sm text-muted-foreground">Hot Spots</div>
          </div>
        </div>

        {/* Most Clicked Elements */}
        <div className="space-y-2">
          <h4 className="font-semibold">Most Clicked Elements</h4>
          <div className="space-y-1">
            {getMostClickedElements().map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs truncate">{item.element}</span>
                <Badge variant="secondary">{item.count} clicks</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <Button onClick={fetchHeatmapData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={generateReport}>
            Generate Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapVisualization;
import React, { useEffect, useRef, useState } from 'react';
import { realtimeManager, RealtimeData } from '@/lib/realtime';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  confidence: number;
  status: 'idle' | 'processing' | 'complete' | 'error';
}

interface Edge {
  from: string;
  to: string;
  active: boolean;
}

const LangGraphCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'data', label: 'DATA', x: 100, y: 150, confidence: 0.9, status: 'complete' },
    { id: 'indicator', label: 'INDICATOR', x: 250, y: 100, confidence: 0.85, status: 'processing' },
    { id: 'sentiment', label: 'SENTIMENT', x: 250, y: 200, confidence: 0.75, status: 'processing' },
    { id: 'strategy', label: 'STRATEGY', x: 400, y: 150, confidence: 0.8, status: 'idle' },
    { id: 'risk', label: 'RISK', x: 550, y: 100, confidence: 0.95, status: 'idle' },
    { id: 'execution', label: 'EXECUTION', x: 550, y: 200, confidence: 0.0, status: 'idle' },
    { id: 'monitor', label: 'MONITOR', x: 700, y: 150, confidence: 1.0, status: 'complete' }
  ]);

  const edges: Edge[] = [
    { from: 'data', to: 'indicator', active: true },
    { from: 'data', to: 'sentiment', active: true },
    { from: 'indicator', to: 'strategy', active: false },
    { from: 'sentiment', to: 'strategy', active: false },
    { from: 'strategy', to: 'risk', active: false },
    { from: 'strategy', to: 'execution', active: false },
    { from: 'risk', to: 'execution', active: false },
    { from: 'execution', to: 'monitor', active: false }
  ];

  useEffect(() => {
    // Subscribe to realtime cognitive state updates
    realtimeManager.subscribe('cognitive_state', (data: RealtimeData) => {
      if (data.payload.node) {
        setNodes(prev => prev.map(node => 
          node.id === data.payload.node 
            ? { ...node, confidence: data.payload.confidence, status: data.payload.status }
            : node
        ));
      }
    });

    // Simulate live updates
    const interval = setInterval(() => {
      realtimeManager.simulateLiveData('cognitive_state');
    }, 2000);

    return () => {
      clearInterval(interval);
      realtimeManager.unsubscribe('cognitive_state');
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 300;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = edge.active ? '#22c55e' : '#374151';
        ctx.lineWidth = edge.active ? 3 : 1;
        ctx.setLineDash(edge.active ? [] : [5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x + 30, fromNode.y);
        ctx.lineTo(toNode.x - 30, toNode.y);
        ctx.stroke();
        
        // Draw arrow
        if (edge.active) {
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          const arrowX = toNode.x - 30;
          const arrowY = toNode.y;
          
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(arrowX - 10 * Math.cos(angle - Math.PI / 6), arrowY - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(arrowX - 10 * Math.cos(angle + Math.PI / 6), arrowY - 10 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle with confidence-based color intensity
      const alpha = Math.max(0.3, node.confidence);
      const statusColors = {
        idle: '#6b7280',
        processing: '#f59e0b',
        complete: '#22c55e',
        error: '#ef4444'
      };
      
      ctx.fillStyle = statusColors[node.status] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.strokeStyle = statusColors[node.status];
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Pulsing effect for processing nodes
      if (node.status === 'processing') {
        const pulseRadius = 25 + Math.sin(Date.now() / 200) * 5;
        ctx.strokeStyle = '#f59e0b40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y - 35);
      
      // Confidence score
      ctx.fillStyle = '#22c55e';
      ctx.font = '8px monospace';
      ctx.fillText((node.confidence * 100).toFixed(0) + '%', node.x, node.y + 40);
    });

    // Draw title
    ctx.fillStyle = '#22c55e';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('LANGGRAPH NEURAL NETWORK - LIVE', 10, 25);
    
    // Draw legend
    const legendY = 280;
    const legendItems = [
      { color: '#6b7280', label: 'IDLE' },
      { color: '#f59e0b', label: 'PROCESSING' },
      { color: '#22c55e', label: 'COMPLETE' },
      { color: '#ef4444', label: 'ERROR' }
    ];
    
    legendItems.forEach((item, i) => {
      const x = 10 + i * 80;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(x, legendY, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#22c55e';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, x + 10, legendY + 3);
    });

  }, [nodes]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="border border-green-500/30 rounded bg-black"
        style={{ width: '100%', height: 'auto' }}
      />
      <div className="absolute top-2 right-2 text-xs font-mono text-green-400/70">
        FPS: 60 | Nodes: {nodes.length} | Active: {nodes.filter(n => n.status === 'processing').length}
      </div>
    </div>
  );
};

export default LangGraphCanvas;
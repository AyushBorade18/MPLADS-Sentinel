import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockStatesData } from '../../data/mockStates';
import { StateRiskData } from '../../types';
import { ArrowUpRight, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface IndiaRiskMapProps {
  onSelectState?: (stateName: string) => void;
  selectedState?: string;
}

export const IndiaRiskMap: React.FC<IndiaRiskMapProps> = ({
  onSelectState,
  selectedState = 'All States',
}) => {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState<StateRiskData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Simplified and aesthetically styled SVG paths representing major regions / states of India
  const stateSvgPaths = [
    {
      id: 'UP',
      name: 'Uttar Pradesh',
      risk: 'High',
      d: 'M 255 160 L 320 155 L 340 185 L 330 220 L 260 215 L 245 180 Z',
      labelX: 290,
      labelY: 185,
    },
    {
      id: 'MH',
      name: 'Maharashtra',
      risk: 'Medium',
      d: 'M 195 270 L 265 260 L 275 320 L 230 350 L 180 320 Z',
      labelX: 225,
      labelY: 300,
    },
    {
      id: 'BR',
      name: 'Bihar',
      risk: 'High',
      d: 'M 340 185 L 395 185 L 405 225 L 350 225 Z',
      labelX: 370,
      labelY: 205,
    },
    {
      id: 'TN',
      name: 'Tamil Nadu',
      risk: 'Low',
      d: 'M 220 420 L 265 420 L 255 480 L 225 480 Z',
      labelX: 240,
      labelY: 450,
    },
    {
      id: 'WB',
      name: 'West Bengal',
      risk: 'Medium',
      d: 'M 395 210 L 425 210 L 415 285 L 385 260 Z',
      labelX: 405,
      labelY: 245,
    },
    {
      id: 'KA',
      name: 'Karnataka',
      risk: 'Medium',
      d: 'M 200 350 L 245 350 L 250 420 L 205 420 Z',
      labelX: 225,
      labelY: 385,
    },
    {
      id: 'RJ',
      name: 'Rajasthan',
      risk: 'Medium',
      d: 'M 175 160 L 245 150 L 245 220 L 175 230 Z',
      labelX: 205,
      labelY: 190,
    },
    {
      id: 'GJ',
      name: 'Gujarat',
      risk: 'Low',
      d: 'M 130 210 L 185 210 L 195 270 L 140 270 Z',
      labelX: 160,
      labelY: 240,
    },
    {
      id: 'MP',
      name: 'Madhya Pradesh',
      risk: 'Medium',
      d: 'M 230 220 L 320 220 L 305 280 L 225 270 Z',
      labelX: 270,
      labelY: 245,
    },
    {
      id: 'KL',
      name: 'Kerala',
      risk: 'Low',
      d: 'M 205 420 L 225 420 L 225 480 L 210 470 Z',
      labelX: 215,
      labelY: 450,
    },
    {
      id: 'JK',
      name: 'Jammu & Kashmir / Ladakh',
      risk: 'Low',
      d: 'M 200 65 L 260 50 L 285 105 L 225 125 Z',
      labelX: 240,
      labelY: 90,
    },
    {
      id: 'PB',
      name: 'Punjab / Haryana',
      risk: 'Low',
      d: 'M 215 125 L 265 125 L 255 165 L 210 160 Z',
      labelX: 235,
      labelY: 145,
    },
    {
      id: 'OD',
      name: 'Odisha',
      risk: 'Low',
      d: 'M 315 260 L 375 260 L 360 320 L 305 300 Z',
      labelX: 340,
      labelY: 285,
    },
    {
      id: 'TG',
      name: 'Telangana / AP',
      risk: 'Medium',
      d: 'M 255 310 L 315 300 L 290 390 L 245 370 Z',
      labelX: 275,
      labelY: 340,
    },
    {
      id: 'NE',
      name: 'North East (Assam & 7 Sisters)',
      risk: 'Low',
      d: 'M 425 175 L 490 170 L 480 230 L 420 215 Z',
      labelX: 450,
      labelY: 195,
    },
  ];

  const getStateFill = (stateName: string, defaultRisk: string) => {
    const isSelected = selectedState.toLowerCase() === stateName.toLowerCase();
    const data = mockStatesData.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
    const highCount = data ? data.highRiskCount : defaultRisk === 'High' ? 30 : defaultRisk === 'Medium' ? 15 : 5;

    if (isSelected) return '#1d4ed8'; // deep highlight blue

    if (highCount >= 25) return '#fca5a5'; // light red/coral
    if (highCount >= 10) return '#fde68a'; // soft amber
    return '#dbeafe'; // soft governance blue/cyan
  };

  const getStateStroke = (stateName: string) => {
    const isSelected = selectedState.toLowerCase() === stateName.toLowerCase();
    return isSelected ? '#1e3a8a' : '#cbd5e1';
  };

  const handleMouseMove = (e: React.MouseEvent, stateName: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    const data = mockStatesData.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
    if (data) {
      setHoveredState(data);
    } else {
      setHoveredState({
        id: stateName,
        name: stateName,
        totalProjects: 140,
        allocatedCr: 350,
        expenditureCr: 280,
        highRiskCount: 3,
        medRiskCount: 12,
        lowRiskCount: 125,
        utilizationRate: 80.0,
        coordinates: [20, 78],
      });
    }
  };

  return (
    <div className="relative bg-white rounded-lg border border-slate-200 p-6 flex flex-col h-full overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900">National Risk Distribution</h3>
          <p className="text-xs text-slate-500">Real-time state & district anomaly mapping</p>
        </div>
        <button
          onClick={() => navigate('/map')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider font-mono group"
        >
          VIEW DETAILS
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Map Controls */}
      <div className="absolute top-20 right-6 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur-xs border border-slate-200 rounded p-1 shadow-xs">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative flex-1 min-h-[380px] w-full flex items-center justify-center bg-slate-50/50 rounded border border-slate-100 p-2 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

        {/* Map Header Watermark (Matches Screenshot 1) */}
        <div className="absolute top-3 left-4 text-left pointer-events-none z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            MPLADS SENTINEL
          </div>
          <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
            PROJECT MONITORING DASHBOARD
          </div>
        </div>

        {/* SVG Map of India */}
        <div
          className="w-full h-full max-w-[480px] transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg
            viewBox="100 30 420 480"
            className="w-full h-full drop-shadow-xs"
            onMouseLeave={() => setHoveredState(null)}
          >
            {/* Ocean surrounding watermark */}
            <text x="140" y="440" className="text-[10px] font-mono fill-slate-300 font-medium">
              Arabian Sea
            </text>
            <text x="360" y="440" className="text-[10px] font-mono fill-slate-300 font-medium">
              Bay of Bengal
            </text>
            <text x="230" y="505" className="text-[10px] font-mono fill-slate-300 font-medium">
              INDIAN OCEAN
            </text>

            {/* State polygons */}
            {stateSvgPaths.map((st) => (
              <g key={st.id} className="cursor-pointer transition-all duration-150">
                <path
                  d={st.d}
                  fill={getStateFill(st.name, st.risk)}
                  stroke={getStateStroke(st.name)}
                  strokeWidth="1.5"
                  className="hover:opacity-90 transition-all"
                  onMouseMove={(e) => handleMouseMove(e, st.name)}
                  onClick={() => {
                    if (onSelectState) onSelectState(st.name);
                  }}
                />
                <text
                  x={st.labelX}
                  y={st.labelY}
                  textAnchor="middle"
                  className="text-[9px] font-mono fill-slate-700 font-semibold pointer-events-none select-none"
                >
                  {st.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Hover Tooltip */}
        {hoveredState && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900 text-white rounded p-3 text-xs shadow-xl border border-slate-700 w-52 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: Math.min(mousePos.x + 12, 260),
              top: Math.min(mousePos.y + 12, 260),
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
              <span className="font-semibold text-slate-100">{hoveredState.name}</span>
              <span className="font-mono text-[10px] bg-red-950 text-red-300 px-1 rounded border border-red-800">
                {hoveredState.highRiskCount} High Risk
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Total Projects:</span>
                <span className="font-semibold text-white">{hoveredState.totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span>Allocated:</span>
                <span className="font-semibold text-white">₹{hoveredState.allocatedCr} Cr</span>
              </div>
              <div className="flex justify-between">
                <span>Expenditure:</span>
                <span className="font-semibold text-white">₹{hoveredState.expenditureCr} Cr</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Utilization:</span>
                <span className="font-semibold">{hoveredState.utilizationRate}%</span>
              </div>
            </div>
            <div className="mt-2 pt-1 border-t border-slate-700 text-[10px] text-slate-400 text-center">
              Click to filter dashboard
            </div>
          </div>
        )}

        {/* Bottom Left Legend (Matches Screenshot 1) */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded p-2.5 shadow-xs text-xs z-10">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            RISK LEVEL
          </p>
          <div className="space-y-1 text-[11px] font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100"></span>
              <span>High (25+ Anomalies)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-100"></span>
              <span>Medium (10-24)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-300 ring-2 ring-blue-100"></span>
              <span>Low (&lt; 10)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

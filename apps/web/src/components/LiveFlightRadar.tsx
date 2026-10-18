import React, { useRef, useEffect } from 'react';
import { useAppStore, useActiveUnit, formatCoordinates } from '@app/shared';
import { Compass, Navigation2, Crosshair } from 'lucide-react';

export const LiveFlightRadar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { units, geofences, activeUnitId } = useAppStore();
  const { unit: activeUnit } = useActiveUnit();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // 1. Clear background
      ctx.fillStyle = '#0B0F17';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Polar Radar Grid & Rings
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 1;

      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 4) * r, 0, Math.PI * 2);
        ctx.stroke();

        // Ring distance labels
        ctx.fillStyle = '#6B7280';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText(`${r * 250}m`, centerX + (radius / 4) * r - 28, centerY - 4);
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Cardinal direction letters
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 11px Inter';
      ctx.fillText('N', centerX - 4, centerY - radius + 14);
      ctx.fillText('S', centerX - 4, centerY + radius - 6);
      ctx.fillText('E', centerX + radius - 14, centerY + 4);
      ctx.fillText('W', centerX - radius + 6, centerY + 4);

      // 3. Draw Radar Sweep Beam
      angle = (angle + 0.02) % (Math.PI * 2);
      const sweepGradient = ctx.createConicGradient(angle, centerX, centerY);
      sweepGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
      sweepGradient.addColorStop(0.12, 'rgba(16, 185, 129, 0.02)');
      sweepGradient.addColorStop(0.2, 'rgba(16, 185, 129, 0)');
      sweepGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.fillStyle = sweepGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Draw Geofence Polygons
      // Center coordinates anchor: San Francisco (37.778, -122.42)
      const centerLat = 37.778;
      const centerLng = -122.42;
      const scale = radius * 45; // coordinate scale factor

      geofences.forEach((zone) => {
        if (!zone.coordinates || zone.coordinates.length < 3) return;

        ctx.beginPath();
        zone.coordinates.forEach((coord, idx) => {
          const px = centerX + (coord.lng - centerLng) * scale;
          const py = centerY - (coord.lat - centerLat) * scale;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();

        if (zone.type === 'delivery_corridor') {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        } else {
          ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fill();
      });

      // 5. Plot Units
      units.forEach((u) => {
        const isActive = u.id === activeUnitId;
        const px = centerX + (u.longitude - centerLng) * scale;
        const py = centerY - (u.latitude - centerLat) * scale;

        // Skip if outside canvas
        if (px < 10 || px > width - 10 || py < 10 || py > height - 10) return;

        // Active Unit Beacon Glow
        if (isActive) {
          ctx.beginPath();
          ctx.arc(px, py, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 22, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Unit Marker Dot
        ctx.beginPath();
        ctx.arc(px, py, isActive ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = u.hazardProximityM < 1.5 ? '#F59E0B' : isActive ? '#34D399' : '#9CA3AF';
        ctx.fill();
        ctx.strokeStyle = '#0B0F17';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Heading Vector line
        const headingRad = ((u.headingDeg - 90) * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(headingRad) * 16, py + Math.sin(headingRad) * 16);
        ctx.strokeStyle = isActive ? '#10B981' : '#6B7280';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Unit ID Label
        ctx.fillStyle = isActive ? '#F9FAFB' : '#9CA3AF';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillText(u.id, px + 8, py - 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [units, geofences, activeUnitId]);

  return (
    <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-subdued-borderDark">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-content-primaryDark">
            Live Tactical Airspace &amp; Radar
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-content-secondaryDark">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Medical Corridor
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-content-secondaryDark">
            <span className="w-2 h-2 rounded-full bg-status-rose" /> No-Fly Zone
          </span>
        </div>
      </div>

      {/* Radar Canvas Container */}
      <div className="relative flex-1 min-h-[340px] flex items-center justify-center my-3 bg-canvas-dark rounded-xl border border-subdued-borderDark overflow-hidden">
        <canvas
          ref={canvasRef}
          width={580}
          height={380}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Tactical Overlays */}
        <div className="absolute top-3 left-3 bg-surface-dark/90 backdrop-blur-md px-3 py-2 rounded-lg border border-subdued-borderDark text-[11px] font-mono space-y-0.5">
          <div className="text-content-secondaryDark flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-emerald-400" />
            <span>Target: {activeUnit?.id}</span>
          </div>
          <div className="text-content-primaryDark font-bold">
            {activeUnit ? formatCoordinates(activeUnit.latitude, activeUnit.longitude) : '--'}
          </div>
        </div>

        <div className="absolute bottom-3 right-3 bg-surface-dark/90 backdrop-blur-md px-3 py-2 rounded-lg border border-subdued-borderDark text-[11px] font-mono space-y-0.5 text-right">
          <div className="text-content-secondaryDark">Heading: {activeUnit?.headingDeg ?? 0}°</div>
          <div className="text-emerald-400 font-bold">Alt: {activeUnit?.altitudeM.toFixed(1)}m AGL</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-content-secondaryDark pt-1 font-mono">
        <span className="flex items-center gap-1">
          <Navigation2 className="w-3.5 h-3.5 text-emerald-400 rotate-45" />
          Real-time GPS drift &amp; Geofence Boundary Collision Detection
        </span>
        <span className="text-emerald-400">10Hz Telemetry Refresh</span>
      </div>
    </div>
  );
};

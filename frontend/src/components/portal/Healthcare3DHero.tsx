import React, { useEffect, useRef } from 'react';
import { useHealthcare } from '../../context/HealthcareContext';

type Point3D = { x: number; y: number; z: number; tone: number };
type Pulse = { x: number; y: number; startedAt: number };

/**
 * Ambient care-network visualization for the portal hero. The canvas sits
 * behind the hero content and responds to pointer movement across the hero.
 */
export const Healthcare3DHero: React.FC = () => {
  const { theme } = useHealthcare();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let time = 0;
    let rotationY = -0.38;
    let rotationX = 0.2;
    const pointer = { x: 0.5, y: 0.5, active: false };
    const pulses: Pulse[] = [];

    const pointCount = 460;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const points: Point3D[] = Array.from({ length: pointCount }, (_, index) => {
      const y = 1 - (index / (pointCount - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = goldenAngle * index;
      return {
        x: Math.cos(angle) * radius,
        y,
        z: Math.sin(angle) * radius,
        tone: index % 11 === 0 ? 2 : index % 5 === 0 ? 1 : 0,
      };
    });

    const anchors = [
      { lat: 4, lng: -36 }, { lat: 24, lng: -62 }, { lat: -16, lng: -54 },
      { lat: 39, lng: -18 }, { lat: -39, lng: -16 }, { lat: 13, lng: 15 },
      { lat: 51, lng: 39 }, { lat: -19, lng: 52 }, { lat: 27, lng: 76 },
      { lat: -43, lng: 82 }, { lat: 3, lng: 108 }, { lat: 58, lng: 124 },
    ];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const toSpherePoint = (lat: number, lng: number, radius: number) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return {
        x: -(radius * Math.sin(phi) * Math.cos(theta)),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta),
      };
    };

    const rotate = (point: { x: number; y: number; z: number }) => {
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const x = point.x * cosY - point.z * sinY;
      const z = point.x * sinY + point.z * cosY;
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      return { x, y: point.y * cosX - z * sinX, z: point.y * sinX + z * cosX };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const inside = event.clientX >= rect.left && event.clientX <= rect.right
        && event.clientY >= rect.top && event.clientY <= rect.bottom;
      pointer.active = inside;
      if (inside) {
        pointer.x = (event.clientX - rect.left) / rect.width;
        pointer.y = (event.clientY - rect.top) / rect.height;
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) return;
      pulses.push({ x: event.clientX - rect.left, y: event.clientY - rect.top, startedAt: time });
      if (pulses.length > 4) pulses.shift();
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget instanceof Node && canvas.contains(event.relatedTarget)) return;
      pointer.active = false;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave);

    const render = () => {
      frame = requestAnimationFrame(render);
      if (!width || !height) return;

      time += 0.012;
      const dark = theme === 'dark';
      const centerX = width * 0.745;
      const centerY = height * 0.54;
      const sphereRadius = Math.min(width * 0.34, height * 0.63, 405);
      const radius = Math.max(78, sphereRadius);
      const targetX = pointer.active ? (pointer.y - 0.5) * 0.5 : 0.2;
      const targetY = pointer.active ? (pointer.x - 0.5) * 0.72 - 0.38 : -0.38 + time * 0.08;
      rotationX += (targetX - rotationX) * 0.035;
      rotationY += (targetY - rotationY) * 0.035;

      ctx.clearRect(0, 0, width, height);

      // Soft atmospheric light gives the globe depth without becoming a panel.
      const glow = ctx.createRadialGradient(centerX, centerY, radius * 0.15, centerX, centerY, radius * 1.65);
      glow.addColorStop(0, dark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(190, 18, 60, 0.10)');
      glow.addColorStop(0.52, dark ? 'rgba(190, 18, 60, 0.075)' : 'rgba(251, 113, 133, 0.075)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.65, 0, Math.PI * 2);
      ctx.fill();

      // Fine orbit rings add a light architectural line behind the network.
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-0.22 + Math.sin(time * 0.35) * 0.025);
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.11)' : 'rgba(94,39,53,0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 8]);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.34, radius * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      const projected = points.map(point => {
        const rotated = rotate({ x: point.x * radius, y: point.y * radius, z: point.z * radius });
        const perspective = 3.7 * radius / (3.7 * radius - rotated.z);
        return { ...rotated, sx: centerX + rotated.x * perspective, sy: centerY + rotated.y * perspective, scale: perspective, tone: point.tone };
      });

      // Subtle latitude and longitude traces make the visualization feel spatial.
      ctx.lineWidth = 0.8;
      for (const latitude of [-58, -28, 0, 28, 58]) {
        ctx.beginPath();
        let drawing = false;
        for (let longitude = -180; longitude <= 180; longitude += 5) {
          const p = rotate(toSpherePoint(latitude, longitude, radius));
          if (p.z > -radius * 0.32) {
            const perspective = 3.7 * radius / (3.7 * radius - p.z);
            const x = centerX + p.x * perspective;
            const y = centerY + p.y * perspective;
            if (!drawing) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            drawing = true;
          } else drawing = false;
        }
        ctx.strokeStyle = latitude === 0
          ? (dark ? 'rgba(251,113,133,0.24)' : 'rgba(190,18,60,0.20)')
          : (dark ? 'rgba(255,255,255,0.075)' : 'rgba(94,39,53,0.075)');
        ctx.stroke();
      }
      for (let meridian = 0; meridian < 6; meridian += 1) {
        const longitude = meridian * 30 - 150;
        ctx.beginPath();
        let drawing = false;
        for (let latitude = -90; latitude <= 90; latitude += 4) {
          const p = rotate(toSpherePoint(latitude, longitude, radius));
          if (p.z > -radius * 0.32) {
            const perspective = 3.7 * radius / (3.7 * radius - p.z);
            if (!drawing) ctx.moveTo(centerX + p.x * perspective, centerY + p.y * perspective);
            else ctx.lineTo(centerX + p.x * perspective, centerY + p.y * perspective);
            drawing = true;
          } else drawing = false;
        }
        ctx.strokeStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(94,39,53,0.05)';
        ctx.stroke();
      }

      // Routes flow outward from a central care hub and carry a traveling pulse.
      const routePoints = anchors.map(({ lat, lng }) => {
        const p = rotate(toSpherePoint(lat, lng, radius));
        const perspective = 3.7 * radius / (3.7 * radius - p.z);
        return { ...p, sx: centerX + p.x * perspective, sy: centerY + p.y * perspective };
      });
      for (let index = 1; index < routePoints.length; index += 1) {
        const start = routePoints[0];
        const end = routePoints[index];
        if (start.z < -radius * 0.5 && end.z < -radius * 0.5) continue;
        const midRaw = toSpherePoint((anchors[0].lat + anchors[index].lat) / 2, (anchors[0].lng + anchors[index].lng) / 2, radius * 1.34);
        const mid = rotate(midRaw);
        const perspective = 3.7 * radius / (3.7 * radius - mid.z);
        const controlX = centerX + mid.x * perspective;
        const controlY = centerY + mid.y * perspective;

        ctx.beginPath();
        ctx.moveTo(start.sx, start.sy);
        ctx.quadraticCurveTo(controlX, controlY, end.sx, end.sy);
        ctx.setLineDash([3, 8]);
        ctx.lineDashOffset = -time * (index % 2 ? 7 : -6);
        ctx.strokeStyle = index % 3 === 0
          ? (dark ? 'rgba(94,234,212,0.24)' : 'rgba(13,148,136,0.20)')
          : (dark ? 'rgba(251,113,133,0.30)' : 'rgba(190,18,60,0.23)');
        ctx.lineWidth = index % 3 === 0 ? 1.25 : 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        const progress = (time * (0.1 + index * 0.008) + index * 0.17) % 1;
        const inverse = 1 - progress;
        const pulseX = inverse * inverse * start.sx + 2 * inverse * progress * controlX + progress * progress * end.sx;
        const pulseY = inverse * inverse * start.sy + 2 * inverse * progress * controlY + progress * progress * end.sy;
        ctx.beginPath();
        ctx.fillStyle = index % 3 === 0 ? '#5eead4' : '#fb7185';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;
        ctx.arc(pulseX, pulseY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // The constellation surface is brighter at the front, giving a soft 3D read.
      projected.forEach((point, index) => {
        if (point.z < -radius * 0.27) return;
        const depth = Math.max(0.12, (point.z + radius) / (radius * 2));
        const alpha = Math.min(0.88, 0.22 + depth * 0.7);
        const size = point.tone === 2 ? 1.7 : point.tone === 1 ? 1.1 : 0.7;
        ctx.beginPath();
        ctx.fillStyle = point.tone === 2
          ? `rgba(251,113,133,${alpha})`
          : point.tone === 1
            ? `rgba(94,234,212,${alpha * 0.86})`
            : dark ? `rgba(255,255,255,${alpha * 0.56})` : `rgba(106,58,71,${alpha * 0.48})`;
        if (point.tone === 2) {
          ctx.shadowColor = '#fb7185';
          ctx.shadowBlur = 8;
        }
        ctx.arc(point.sx, point.sy, size * point.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (index % 26 === 0) {
          ctx.beginPath();
          ctx.fillStyle = dark ? 'rgba(255,255,255,0.75)' : 'rgba(126,57,75,0.7)';
          ctx.arc(point.sx, point.sy, 2.4 * point.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.strokeStyle = dark ? 'rgba(255,255,255,0.18)' : 'rgba(190,18,60,0.15)';
          ctx.lineWidth = 0.8;
          ctx.arc(point.sx, point.sy, 6 + Math.sin(time * 2 + index) * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Small interaction ripples bloom where a visitor presses in the hero.
      for (let index = pulses.length - 1; index >= 0; index -= 1) {
        const pulse = pulses[index];
        const age = time - pulse.startedAt;
        if (age > 2.8) {
          pulses.splice(index, 1);
          continue;
        }
        ctx.beginPath();
        ctx.strokeStyle = dark ? `rgba(251,113,133,${(1 - age / 2.8) * 0.34})` : `rgba(190,18,60,${(1 - age / 2.8) * 0.27})`;
        ctx.lineWidth = 1;
        ctx.arc(pulse.x, pulse.y, age * 32, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="portal-network-canvas" aria-hidden="true" />;
};

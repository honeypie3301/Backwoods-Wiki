import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleDepth: number;
  phase: number;
  color: string;
  isSpecialFlare: boolean;
  spikeLength: number;
}

interface ConstellationStar {
  relX: number;
  relY: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleDepth: number;
  phase: number;
  color: string;
  isSpecialFlare: boolean;
  spikeLength: number;
}

interface ConstellationCluster {
  x: number;
  y: number;
  scale: number;
  stars: ConstellationStar[];
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

// Normalized authentic constellation coordinate star maps (nx, ny in 0..1)
// Strictly star positions only; NO connecting lines are drawn per specification
const CONSTELLATIONS: { name: string; stars: [number, number][] }[] = [
  {
    name: 'Ursa Major (Big Dipper)',
    stars: [
      [0.06, 0.42], // Alkaid
      [0.20, 0.36], // Mizar
      [0.34, 0.38], // Alioth
      [0.50, 0.40], // Megrez
      [0.53, 0.74], // Phecda
      [0.82, 0.70], // Merak
      [0.79, 0.36], // Dubhe
    ],
  },
  {
    name: 'Orion',
    stars: [
      [0.22, 0.18], // Betelgeuse
      [0.78, 0.16], // Bellatrix
      [0.38, 0.50], // Alnitak
      [0.50, 0.51], // Alnilam
      [0.62, 0.52], // Mintaka
      [0.28, 0.84], // Saiph
      [0.82, 0.82], // Rigel
    ],
  },
  {
    name: 'Cassiopeia',
    stars: [
      [0.10, 0.58], // Caph
      [0.30, 0.34], // Schedar
      [0.52, 0.50], // Gamma Cas
      [0.72, 0.24], // Ruchbah
      [0.90, 0.38], // Segin
    ],
  },
  {
    name: 'Cygnus (Northern Cross)',
    stars: [
      [0.50, 0.12], // Deneb
      [0.50, 0.50], // Sadr
      [0.50, 0.94], // Albireo
      [0.16, 0.48], // Gienah
      [0.84, 0.48], // Fawaris
    ],
  },
  {
    name: 'Crux (Southern Cross)',
    stars: [
      [0.50, 0.88], // Acrux
      [0.50, 0.14], // Gacrux
      [0.18, 0.46], // Mimosa
      [0.82, 0.48], // Imai
      [0.66, 0.64], // Ginan
    ],
  },
];

const TWO_PI = Math.PI * 2;

export default function StarlightBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (theme !== 'starlight') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let constellation: ConstellationCluster | null = null;
    let shootingStar: ShootingStar | null = null;
    let lastTime = performance.now();

    // Rare shooting stars: first spawn at 35s - 80s, subsequent every 50s - 115s
    let nextShootingStarTime = Date.now() + 35000 + Math.random() * 45000;

    // Rolls-Royce fiber-optic palette: brilliant white, diamond ice blue, and platinum silver
    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(235, 245, 255, ',
      'rgba(215, 235, 255, ',
      'rgba(225, 230, 245, ',
      'rgba(245, 248, 255, ',
    ];

    const initStars = (width: number, height: number) => {
      // Balanced star density for authentic Rolls-Royce Starlight Headliner experience
      const count = Math.max(300, Math.floor((width * height) / 2400));
      stars = [];
      constellation = null;

      // 1. Generate randomly positioned stars with every load
      for (let i = 0; i < count; i++) {
        const sizeSeed = Math.random();
        // Crisp fiber-optic pinpoints: 78% delicate pinpoints (0.65-0.95px), 16% medium (1.0-1.35px), 6% prominent stars (1.4-1.8px)
        let radius = 0.65 + Math.random() * 0.30;
        let isSpecialFlare = false;
        let spikeLength = 0;

        if (sizeSeed > 0.94) {
          radius = 1.40 + Math.random() * 0.40;
          isSpecialFlare = true;
          spikeLength = 2.2 + Math.random() * 1.8;
        } else if (sizeSeed > 0.78) {
          radius = 1.00 + Math.random() * 0.35;
        }

        const color = colors[Math.floor(Math.random() * colors.length)];
        // Visible base alpha range: 0.45 - 0.90
        const baseAlpha = 0.45 + Math.random() * 0.45;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha,
          // Gentle, calm twinkle: slower speed and subtle depth
          twinkleSpeed: 0.003 + Math.random() * 0.005,
          twinkleDepth: 0.08 + Math.random() * 0.12,
          phase: Math.random() * TWO_PI,
          color,
          isSpecialFlare,
          spikeLength,
        });
      }

      // 2. Rare real constellation feature (~40% chance on app load)
      // Plots authentic star positions; NO connecting lines are drawn
      if (Math.random() < 0.40) {
        const chosenConstellation = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
        const scale = 150 + Math.random() * 130; // 150px to 280px bounding box
        const angle = (Math.random() - 0.5) * 0.5; // slight natural celestial slant (-14° to +14°)
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Place safely away from viewport edges
        const marginX = Math.min(width * 0.15, 140);
        const marginY = Math.min(height * 0.15, 110);
        const anchorX = marginX + Math.random() * Math.max(10, width - marginX * 2 - scale);
        const anchorY = marginY + Math.random() * Math.max(10, height - marginY * 2 - scale);

        const clusterStars: ConstellationStar[] = chosenConstellation.stars.map(([nx, ny]) => {
          const rawX = (nx - 0.5) * scale;
          const rawY = (ny - 0.5) * scale;
          const rotX = rawX * cosA - rawY * sinA;
          const rotY = rawX * sinA + rawY * cosA;

          return {
            relX: scale * 0.5 + rotX,
            relY: scale * 0.5 + rotY,
            radius: 1.15 + Math.random() * 0.35,
            baseAlpha: 0.75 + Math.random() * 0.20,
            twinkleSpeed: 0.002 + Math.random() * 0.004,
            twinkleDepth: 0.06 + Math.random() * 0.08,
            phase: Math.random() * TWO_PI,
            color: 'rgba(255, 255, 255, ',
            isSpecialFlare: true,
            spikeLength: 2.0 + Math.random() * 1.5,
          };
        });

        constellation = {
          x: anchorX,
          y: anchorY,
          scale,
          stars: clusterStars,
        };
      }
    };

    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars(width, height);
    };

    // Instant setup & synchronous initial frame render
    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (currentTime: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Delta time in seconds (capped at 0.1s to prevent jumps after tab throttling)
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Celestial planetary rotation physics:
      // Observer stands on a rotating celestial body.
      // Distant celestial pole located high above screen:
      const poleX = width * 0.5;
      const poleY = -height * 0.9;
      // Very slow angular orbital velocity (~0.000075 rad/s) + subtle radial drift (0.012 px/s)
      const angularSpeed = 0.000075;
      const radialSpeed = 0.012;

      // Solid pitch-black canvas background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const margin = 35;
      const wrapWidth = width + margin * 2;
      const wrapHeight = height + margin * 2;

      // 1. Draw and update field stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        // Celestial orbital pan & subtle radial drift calculation
        const dx = star.x - poleX;
        const dy = star.y - poleY;
        const dist = Math.hypot(dx, dy) || 1;

        // Tangential velocity vector (-dy/dist, dx/dist) * (angularSpeed * dist) = (-dy * angularSpeed, dx * angularSpeed)
        const vx = -dy * angularSpeed + (dx / dist) * radialSpeed;
        const vy = dx * angularSpeed + (dy / dist) * radialSpeed;

        star.x += vx * dt;
        star.y += vy * dt;

        // Toroidal screen boundary wrapping
        if (star.x > width + margin) star.x -= wrapWidth;
        else if (star.x < -margin) star.x += wrapWidth;

        if (star.y > height + margin) star.y -= wrapHeight;
        else if (star.y < -margin) star.y += wrapHeight;

        star.phase += star.twinkleSpeed;

        // Gentle, subtle sinusoidal twinkle pulse
        const sinVal = Math.sin(star.phase);
        const dynamicAlpha = Math.max(0.18, Math.min(0.95, star.baseAlpha + sinVal * star.twinkleDepth));

        // Core pinpoint star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, TWO_PI);
        ctx.fillStyle = `${star.color}${dynamicAlpha.toFixed(3)})`;
        ctx.fill();

        // Subtle subdued optical bloom only around larger stars
        if (star.radius > 1.15) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 1.5, 0, TWO_PI);
          ctx.fillStyle = `${star.color}${(dynamicAlpha * 0.08).toFixed(3)})`;
          ctx.fill();
        }

        // Diamond 4-point micro-diffraction spike for prominent stars
        if (star.isSpecialFlare && dynamicAlpha > 0.6) {
          const spikeAlpha = (dynamicAlpha * 0.20).toFixed(3);
          ctx.strokeStyle = `${star.color}${spikeAlpha})`;
          ctx.lineWidth = 0.5;

          // Horizontal spike
          ctx.beginPath();
          ctx.moveTo(star.x - star.spikeLength * 0.75, star.y);
          ctx.lineTo(star.x + star.spikeLength * 0.75, star.y);
          ctx.stroke();

          // Vertical spike
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - star.spikeLength * 0.75);
          ctx.lineTo(star.x, star.y + star.spikeLength * 0.75);
          ctx.stroke();
        }
      }

      // 2. Draw and update intact constellation cluster (preserves exact stellar geometry)
      if (constellation) {
        const dx = constellation.x - poleX;
        const dy = constellation.y - poleY;
        const dist = Math.hypot(dx, dy) || 1;

        const cvx = -dy * angularSpeed + (dx / dist) * radialSpeed;
        const cvy = dx * angularSpeed + (dy / dist) * radialSpeed;

        constellation.x += cvx * dt;
        constellation.y += cvy * dt;

        const clusterMargin = constellation.scale + margin;
        if (constellation.x > width + clusterMargin) constellation.x -= width + clusterMargin * 2;
        else if (constellation.x < -clusterMargin) constellation.x += width + clusterMargin * 2;

        if (constellation.y > height + clusterMargin) constellation.y -= height + clusterMargin * 2;
        else if (constellation.y < -clusterMargin) constellation.y += height + clusterMargin * 2;

        for (let i = 0; i < constellation.stars.length; i++) {
          const cStar = constellation.stars[i];
          const starX = constellation.x + cStar.relX;
          const starY = constellation.y + cStar.relY;

          cStar.phase += cStar.twinkleSpeed;
          const sinVal = Math.sin(cStar.phase);
          const dynamicAlpha = Math.max(0.18, Math.min(0.95, cStar.baseAlpha + sinVal * cStar.twinkleDepth));

          ctx.beginPath();
          ctx.arc(starX, starY, cStar.radius, 0, TWO_PI);
          ctx.fillStyle = `${cStar.color}${dynamicAlpha.toFixed(3)})`;
          ctx.fill();

          if (cStar.radius > 1.15) {
            ctx.beginPath();
            ctx.arc(starX, starY, cStar.radius * 1.5, 0, TWO_PI);
            ctx.fillStyle = `${cStar.color}${(dynamicAlpha * 0.08).toFixed(3)})`;
            ctx.fill();
          }

          if (cStar.isSpecialFlare && dynamicAlpha > 0.6) {
            const spikeAlpha = (dynamicAlpha * 0.20).toFixed(3);
            ctx.strokeStyle = `${cStar.color}${spikeAlpha})`;
            ctx.lineWidth = 0.5;

            ctx.beginPath();
            ctx.moveTo(starX - cStar.spikeLength * 0.75, starY);
            ctx.lineTo(starX + cStar.spikeLength * 0.75, starY);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(starX, starY - cStar.spikeLength * 0.75);
            ctx.lineTo(starX, starY + cStar.spikeLength * 0.75);
            ctx.stroke();
          }
        }
      }

      // 3. Rare Rolls-Royce Signature Shooting Star
      const now = Date.now();
      if (!shootingStar && now > nextShootingStarTime) {
        shootingStar = {
          x: Math.random() * (width * 0.75),
          y: Math.random() * (height * 0.45),
          length: 70 + Math.random() * 80,
          speed: 8 + Math.random() * 5,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 0.80,
          active: true,
        };
        // Rare interval: next in 50s to 115s
        nextShootingStarTime = now + 50000 + Math.random() * 65000;
      }

      if (shootingStar && shootingStar.active) {
        const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
        const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

        const grad = ctx.createLinearGradient(shootingStar.x, shootingStar.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.alpha})`);
        grad.addColorStop(0.35, `rgba(220, 235, 255, ${(shootingStar.alpha * 0.65).toFixed(2)})`);
        grad.addColorStop(1, 'rgba(200, 225, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Small pinpoint head
        ctx.beginPath();
        ctx.arc(shootingStar.x, shootingStar.y, 1.0, 0, TWO_PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${shootingStar.alpha})`;
        ctx.fill();

        shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
        shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
        shootingStar.alpha -= 0.012;

        if (shootingStar.alpha <= 0 || shootingStar.x > width + 100 || shootingStar.y > height + 100) {
          shootingStar = null;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Tab visibility throttling: pause canvas when tab is hidden, resume when active
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial frame render
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  if (theme !== 'starlight') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Canvas rendering instantly initialized pitch-black starlight backdrop */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />
    </div>
  );
}

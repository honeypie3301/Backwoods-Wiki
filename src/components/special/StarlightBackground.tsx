import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { initRadiansSync } from '../../utils/radiansSync';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleDepth: number;
  phase: number;
  isSpecialFlare: boolean;
  spriteIndex: number;
}

interface ConstellationStar {
  relX: number;
  relY: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleDepth: number;
  phase: number;
  isSpecialFlare: boolean;
  spriteIndex: number;
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

const CONSTELLATIONS: { name: string; stars: [number, number][] }[] = [
  {
    name: 'Ursa Major (Big Dipper)',
    stars: [
      [0.06, 0.42],
      [0.20, 0.36],
      [0.34, 0.38],
      [0.50, 0.40],
      [0.53, 0.74],
      [0.82, 0.70],
      [0.79, 0.36],
    ],
  },
  {
    name: 'Orion',
    stars: [
      [0.22, 0.18],
      [0.78, 0.16],
      [0.38, 0.50],
      [0.50, 0.51],
      [0.62, 0.52],
      [0.28, 0.84],
      [0.82, 0.82],
    ],
  },
  {
    name: 'Cassiopeia',
    stars: [
      [0.10, 0.58],
      [0.30, 0.34],
      [0.52, 0.50],
      [0.72, 0.24],
      [0.90, 0.38],
    ],
  },
  {
    name: 'Cygnus (Northern Cross)',
    stars: [
      [0.50, 0.12],
      [0.50, 0.50],
      [0.50, 0.94],
      [0.16, 0.48],
      [0.84, 0.48],
    ],
  },
  {
    name: 'Crux (Southern Cross)',
    stars: [
      [0.50, 0.88],
      [0.50, 0.14],
      [0.18, 0.46],
      [0.82, 0.48],
      [0.66, 0.64],
    ],
  },
];

const TWO_PI = Math.PI * 2;

export const CELESTIAL_CONFIG = {
  angularSpeed: 0.000075,
  radialSpeed: 0.012,
  motionBlurMinSpeed: 0.002,
  motionBlurLengthFactor: 1.0,
};

/**
 * Pre-render offscreen canvas star sprites for hardware-accelerated drawImage blitting
 */
function createStarSprites() {
  const createCanvas = (size: number) => {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    return c;
  };

  // 1. Small pinpoint star (4x4)
  const small = createCanvas(4);
  const ctxS = small.getContext('2d')!;
  ctxS.fillStyle = 'rgba(235, 245, 255, 1)';
  ctxS.beginPath();
  ctxS.arc(2, 2, 0.85, 0, TWO_PI);
  ctxS.fill();

  // 2. Medium star with subtle halo (8x8)
  const medium = createCanvas(8);
  const ctxM = medium.getContext('2d')!;
  ctxM.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctxM.beginPath();
  ctxM.arc(4, 4, 3.2, 0, TWO_PI);
  ctxM.fill();
  ctxM.fillStyle = 'rgba(255, 255, 255, 1)';
  ctxM.beginPath();
  ctxM.arc(4, 4, 1.25, 0, TWO_PI);
  ctxM.fill();

  // 3. Prominent flare star with optical diffraction spikes (24x24)
  const flare = createCanvas(24);
  const ctxF = flare.getContext('2d')!;
  // Soft outer glow
  ctxF.fillStyle = 'rgba(235, 245, 255, 0.18)';
  ctxF.beginPath();
  ctxF.arc(12, 12, 6.0, 0, TWO_PI);
  ctxF.fill();
  // Core star
  ctxF.fillStyle = 'rgba(255, 255, 255, 1)';
  ctxF.beginPath();
  ctxF.arc(12, 12, 1.6, 0, TWO_PI);
  ctxF.fill();
  // Diffraction spikes
  ctxF.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctxF.lineWidth = 0.75;
  ctxF.beginPath();
  ctxF.moveTo(3, 12);
  ctxF.lineTo(21, 12);
  ctxF.moveTo(12, 3);
  ctxF.lineTo(12, 21);
  ctxF.stroke();

  return [
    { canvas: small, offset: 2 },
    { canvas: medium, offset: 4 },
    { canvas: flare, offset: 12 },
  ];
}

export default function StarlightBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return initRadiansSync();
  }, []);

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
    let sprites: ReturnType<typeof createStarSprites> | null = null;

    let nextShootingStarTime = Date.now() + 35000 + Math.random() * 45000;

    const initStars = (width: number, height: number) => {
      if (!sprites) {
        sprites = createStarSprites();
      }

      const count = Math.max(250, Math.floor((width * height) / 2800));
      stars = [];
      constellation = null;

      for (let i = 0; i < count; i++) {
        const sizeSeed = Math.random();
        let radius = 0.65 + Math.random() * 0.30;
        let isSpecialFlare = false;
        let spriteIndex = 0;

        if (sizeSeed > 0.94) {
          radius = 1.40 + Math.random() * 0.40;
          isSpecialFlare = true;
          spriteIndex = 2; // Flare sprite
        } else if (sizeSeed > 0.78) {
          radius = 1.00 + Math.random() * 0.35;
          spriteIndex = 1; // Medium sprite
        } else {
          spriteIndex = 0; // Small sprite
        }

        const baseAlpha = 0.45 + Math.random() * 0.45;

        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha,
          twinkleSpeed: 0.003 + Math.random() * 0.005,
          twinkleDepth: 0.08 + Math.random() * 0.12,
          phase: Math.random() * TWO_PI,
          isSpecialFlare,
          spriteIndex,
        });
      }

      if (Math.random() < 0.40) {
        const chosenConstellation = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
        const scale = 150 + Math.random() * 130;
        const angle = (Math.random() - 0.5) * 0.5;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

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
            radius: 1.25,
            baseAlpha: 0.75 + Math.random() * 0.20,
            twinkleSpeed: 0.002 + Math.random() * 0.004,
            twinkleDepth: 0.06 + Math.random() * 0.08,
            phase: Math.random() * TWO_PI,
            isSpecialFlare: true,
            spriteIndex: 2,
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
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR to 1.5x for performance

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      const width = window.innerWidth;
      const height = window.innerHeight;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const poleX = width * 0.5;
      const poleY = -height * 0.9;
      const angularSpeed = CELESTIAL_CONFIG.angularSpeed;
      const radialSpeed = CELESTIAL_CONFIG.radialSpeed;

      // Pitch black canvas clear
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const margin = 35;
      const wrapWidth = width + margin * 2;
      const wrapHeight = height + margin * 2;

      const enableMotionBlur = angularSpeed >= CELESTIAL_CONFIG.motionBlurMinSpeed;
      const blurFactor = CELESTIAL_CONFIG.motionBlurLengthFactor;

      if (!sprites) {
        sprites = createStarSprites();
      }

      // 1. Hardware-accelerated drawImage render loop for field stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        const dx = star.x - poleX;
        const dy = star.y - poleY;
        const dist = Math.hypot(dx, dy) || 1;

        const vx = -dy * angularSpeed + (dx / dist) * radialSpeed;
        const vy = dx * angularSpeed + (dy / dist) * radialSpeed;

        star.x += vx * dt;
        star.y += vy * dt;

        if (star.x > width + margin) star.x -= wrapWidth;
        else if (star.x < -margin) star.x += wrapWidth;

        if (star.y > height + margin) star.y -= wrapHeight;
        else if (star.y < -margin) star.y += wrapHeight;

        star.phase += star.twinkleSpeed;
        const sinVal = Math.sin(star.phase);
        const dynamicAlpha = Math.max(0.18, Math.min(0.95, star.baseAlpha + sinVal * star.twinkleDepth));

        if (enableMotionBlur) {
          const streakVx = vx * dt * 1.5 * blurFactor;
          const streakVy = vy * dt * 1.5 * blurFactor;
          const streakLen = Math.hypot(streakVx, streakVy);

          if (streakLen > 0.5) {
            ctx.beginPath();
            ctx.moveTo(star.x - streakVx, star.y - streakVy);
            ctx.lineTo(star.x, star.y);
            ctx.strokeStyle = `rgba(235,245,255,${(dynamicAlpha * 0.7).toFixed(2)})`;
            ctx.lineWidth = Math.max(0.75, star.radius * 1.4);
            ctx.stroke();
          }
        }

        const sprite = sprites[star.spriteIndex];
        ctx.globalAlpha = dynamicAlpha;
        ctx.drawImage(sprite.canvas, star.x - sprite.offset, star.y - sprite.offset);
      }

      // 2. Constellation cluster stars
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

          const sprite = sprites[cStar.spriteIndex];
          ctx.globalAlpha = dynamicAlpha;
          ctx.drawImage(sprite.canvas, starX - sprite.offset, starY - sprite.offset);
        }
      }

      ctx.globalAlpha = 1.0;

      // 3. Rare Shooting Star
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
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />
    </div>
  );
}


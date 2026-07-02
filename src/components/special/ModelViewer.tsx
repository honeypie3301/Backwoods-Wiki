import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Maximize2, RotateCw, Sun, Moon, Sparkles, HelpCircle, 
  Cpu, FileCode, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';

interface ModelViewerProps {
  modelUrl: string;
  textureUrl: string;
  entityId: string;
  entityName: string;
}

export default function ModelViewer({ modelUrl, textureUrl, entityId, entityName }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // UI and loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<{ vertices: number; polygons: number } | null>(null);

  // Viewer options
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [renderMode, setRenderMode] = useState<'textured' | 'wireframe'>('textured');
  const lightingPreset = 'backwoods';

  const autoRotateRef = useRef<boolean>(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Three.js object references for dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const pedestalRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const loadedTextureRef = useRef<THREE.Texture | null>(null);
  
  // Lighting references
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLight1Ref = useRef<THREE.DirectionalLight | null>(null);
  const dirLight2Ref = useRef<THREE.DirectionalLight | null>(null);
  const pointLightRef = useRef<THREE.PointLight | null>(null);

  // 1. Reset and Rebuild Scene when modelUrl or textureUrl changes
  useEffect(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setLoadProgress(10);
    setError(null);
    setDiagnostics(null);
    loadedTextureRef.current = null;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080a08);
    scene.fog = new THREE.FogExp2(0x080a08, 0.04);
    sceneRef.current = scene;

    // Create camera
    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 8);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear previous children
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 1.9; // don't go too far underground
    controls.minDistance = 1.5;
    controls.maxDistance = 18;
    controlsRef.current = controls;

    // Create model group
    const modelGroup = new THREE.Group();
    modelGroup.rotation.y = Math.PI; // Default facing the front (180 deg rotated)
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Build environment lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);
    dirLight1Ref.current = dirLight1;

    const dirLight2 = new THREE.DirectionalLight(0xa3b1ff, 0.4);
    dirLight2.position.set(-5, 4, -5);
    scene.add(dirLight2);
    dirLight2Ref.current = dirLight2;

    const pointLight = new THREE.PointLight(0x709978, 1.2, 10);
    pointLight.position.set(0, 0.1, 0);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // Add Pedestal base
    const pedestalGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.25, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x141814,
      roughness: 0.8,
      metalness: 0.5,
      bumpScale: 0.05
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.125;
    pedestal.receiveShadow = true;
    scene.add(pedestal);
    pedestalRef.current = pedestal;

    // Add a glowing rim for the pedestal
    const rimGeo = new THREE.RingGeometry(2.48, 2.52, 32);
    rimGeo.rotateX(-Math.PI / 2);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x709978,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.01;
    pedestal.add(rim);

    // Apply active lighting preset
    applyLightingPreset(lightingPreset, scene, ambientLight, dirLight1, dirLight2, pointLight);

    // Build Particles
    buildParticles(entityId, scene);

    // Resolve paths dynamically based on modelUrl
    const lastSlash = modelUrl.lastIndexOf('/');
    const basePath = lastSlash !== -1 ? modelUrl.substring(0, lastSlash + 1) : '/';
    const modelFile = lastSlash !== -1 ? modelUrl.substring(lastSlash + 1) : modelUrl;
    const mtlFile = modelFile.replace(/\.obj$/i, '.mtl');

    const loadModel = (materials: any) => {
      const objLoader = new OBJLoader();
      if (materials) {
        objLoader.setMaterials(materials);
      }
      objLoader.setPath(basePath);

      objLoader.load(
        modelFile,
        (obj) => {
          setLoadProgress(90);

          let totalVertices = 0;
          let totalPolygons = 0;

          obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              const geometry = child.geometry;
              if (geometry) {
                totalVertices += geometry.attributes.position.count;
                if (geometry.index) {
                  totalPolygons += geometry.index.count / 3;
                } else {
                  totalPolygons += geometry.attributes.position.count / 3;
                }
              }
            }
          });

          setDiagnostics({
            vertices: totalVertices,
            polygons: Math.round(totalPolygons)
          });

          // Compute bounding box to normalize scale and offset
          const box = new THREE.Box3().setFromObject(obj);
          const size = new THREE.Vector3();
          box.getSize(size);
          const center = new THREE.Vector3();
          box.getCenter(center);

          // Offset model so its pivot sits on top of pedestal
          obj.position.x = -center.x;
          obj.position.y = -box.min.y; // bottom of model sits at 0
          obj.position.z = -center.z;

          // Scale to fit nicely
          const maxDim = Math.max(size.x, size.y, size.z);
          let desiredScale = maxDim > 0 ? 3.0 / maxDim : 1.0;
          if (entityId === 'fractus_prime') {
            desiredScale *= 2.0;
          } else if (entityId === 'rot') {
            desiredScale *= 1.25;
          } else if (entityId === 'lignum_gigas') {
            desiredScale *= 40.0;
          }
          modelGroup.scale.set(desiredScale, desiredScale, desiredScale);
          if (entityId === 'fractus' || entityId === 'fractus_prime') {
            modelGroup.position.y = 0.25; // lift up
          } else {
            modelGroup.position.y = 0; // base sits on pedestal
          }

          // Load custom texture override if textureUrl is specified
          if (textureUrl) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(
              textureUrl,
              (texture) => {
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                loadedTextureRef.current = texture;
                applyMaterials(obj, texture, renderMode);
                setLoading(false);
                setLoadProgress(100);
              },
              undefined,
              (err) => {
                console.warn('Error loading texture override, falling back to MTL textures:', err);
                applyMaterials(obj, null, renderMode);
                setLoading(false);
                setLoadProgress(100);
              }
            );
          } else {
            applyMaterials(obj, null, renderMode);
            setLoading(false);
            setLoadProgress(100);
          }

          // Add to scene group
          modelGroup.add(obj);

          // Reset camera target
          controls.target.set(0, 1.3, 0);
          controls.update();
        },
        (xhr) => {
          if (xhr.total > 0) {
            const pct = Math.round((xhr.loaded / xhr.total) * 30) + 60;
            setLoadProgress(pct);
          }
        },
        (err) => {
          console.error('Error loading OBJ:', err);
          createProceduralModel(entityId, modelGroup);
          setLoading(false);
          setLoadProgress(100);
          setDiagnostics({ vertices: 384, polygons: 128 });
        }
      );
    };

    if (modelUrl) {
      setLoadProgress(30);
      const mtlLoader = new MTLLoader();
      mtlLoader.setPath(basePath);
      mtlLoader.load(
        mtlFile,
        (materials) => {
          materials.preload();
          // Configure pixel-art NearestFilter for MTLLoader-loaded textures
          Object.keys(materials.materials).forEach((key) => {
            const mat = materials.materials[key];
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
              if (mat.map) {
                mat.map.magFilter = THREE.NearestFilter;
                mat.map.minFilter = THREE.NearestFilter;
              }
            }
          });
          setLoadProgress(60);
          loadModel(materials);
        },
        undefined,
        (err) => {
          console.warn(`MTL file not found or failed to load (${mtlFile}), loading OBJ directly...`);
          setLoadProgress(60);
          loadModel(null);
        }
      );
    } else {
      // Procedural model for core biological rot
      createProceduralModel(entityId, modelGroup);
      if (entityId === 'rot') {
        modelGroup.scale.set(1.25, 1.25, 1.25);
      }
      setLoading(false);
      setLoadProgress(100);
      setDiagnostics({ vertices: 384, polygons: 128 });
    }

    // Animation variables
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Pedestal rotation
      if (pedestalRef.current) {
        pedestalRef.current.rotation.y = elapsed * 0.15;
      }

      // Auto rotation and floating of model
      if (modelGroupRef.current) {
        if (autoRotateRef.current) {
          modelGroupRef.current.rotation.y = elapsed * 0.25 + Math.PI;
        }
        if (entityId === 'fractus' || entityId === 'fractus_prime') {
          // Floating wave animation to prevent Z-fighting and add style
          modelGroupRef.current.position.y = 0.25 + Math.sin(elapsed * 1.5) * 0.12;
        } else {
          modelGroupRef.current.position.y = 0;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [modelUrl, textureUrl, entityId]);

  // 2. React to renderMode changes without reloading the whole file
  useEffect(() => {
    if (!modelGroupRef.current) return;
    
    // Find texture
    const modelGroup = modelGroupRef.current;
    let foundTexture: THREE.Texture | null = loadedTextureRef.current;

    if (!foundTexture) {
      // Seek existing texture
      modelGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const original = child.userData.originalMaterial || child.material;
          const mats = Array.isArray(original) ? original : [original];
          for (const mat of mats) {
            if (mat && (mat as any).map) {
              foundTexture = (mat as any).map;
              break;
            }
          }
        }
      });
    }

    // Apply materials
    applyMaterials(modelGroup, foundTexture, renderMode);
  }, [renderMode]);

  // 3. React to lightingPreset changes
  useEffect(() => {
    const scene = sceneRef.current;
    const ambientLight = ambientLightRef.current;
    const dirLight1 = dirLight1Ref.current;
    const dirLight2 = dirLight2Ref.current;
    const pointLight = pointLightRef.current;

    if (scene && ambientLight && dirLight1 && dirLight2 && pointLight) {
      applyLightingPreset(lightingPreset, scene, ambientLight, dirLight1, dirLight2, pointLight);
    }
  }, [lightingPreset]);

  // Reusable utility to apply material settings
  const applyMaterials = (object: THREE.Object3D, texture: THREE.Texture | null, mode: 'textured' | 'wireframe') => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Ensure we back up original loaded material
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material;
        }

        if (mode === 'wireframe') {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x709978,
            wireframe: true
          });
        } else {
          // textured mode
          if (texture) {
            if (!child.userData.texturedMaterial) {
              const baseMat = child.userData.originalMaterial || child.material;
              const matName = Array.isArray(baseMat) ? baseMat[0]?.name : baseMat?.name;

              child.userData.texturedMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: 0.85,
                metalness: 0.1,
                flatShading: true,
                transparent: true,
                alphaTest: 0.15, // Solves transparency clip-out for hair overlays or outer skin layers
                side: THREE.DoubleSide // Essential to render both sides of boxes/flaps in entity models
              });
              child.userData.texturedMaterial.name = matName || '';
            }
            child.material = child.userData.texturedMaterial;
          } else {
            // Restore original material loaded from mtl file
            child.material = child.userData.originalMaterial;

            // Update pre-loaded materials with pixel-art settings
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
                if (mat.map) {
                  mat.map.magFilter = THREE.NearestFilter;
                  mat.map.minFilter = THREE.NearestFilter;
                  mat.map.needsUpdate = true;
                }
                if (mat instanceof THREE.MeshStandardMaterial) {
                  mat.roughness = 0.85;
                  mat.metalness = 0.1;
                }
                mat.flatShading = true;
                mat.transparent = true;
                mat.alphaTest = 0.15;
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
              }
            });
          }
        }
      }
    });
  };

  // Preset environmental lighting configs
  const applyLightingPreset = (
    preset: 'neutral' | 'overworld' | 'backwoods' | 'substrata',
    scene: THREE.Scene,
    ambient: THREE.AmbientLight,
    dir1: THREE.DirectionalLight,
    dir2: THREE.DirectionalLight,
    point: THREE.PointLight
  ) => {
    if (preset === 'neutral') {
      scene.background = new THREE.Color(0x0f110f);
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.setHex(0x0f110f);
      }
      ambient.color.setHex(0xffffff);
      ambient.intensity = 1.0;
      dir1.color.setHex(0xffffff);
      dir1.intensity = 1.4;
      dir1.position.set(4, 10, 4);
      dir2.color.setHex(0xffffff);
      dir2.intensity = 0.6;
      point.color.setHex(0x555555);
      point.intensity = 0;
    } else if (preset === 'overworld') {
      scene.background = new THREE.Color(0x141a14);
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.setHex(0x141a14);
      }
      ambient.color.setHex(0xd0e8ff);
      ambient.intensity = 0.85;
      dir1.color.setHex(0xfffaed);
      dir1.intensity = 1.5;
      dir1.position.set(6, 12, 3);
      dir2.color.setHex(0x2d4234);
      dir2.intensity = 0.7;
      point.color.setHex(0x709978);
      point.intensity = 0.5;
    } else if (preset === 'substrata') {
      scene.background = new THREE.Color(0x050705);
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.setHex(0x050705);
      }
      ambient.color.setHex(0x0e1f13);
      ambient.intensity = 0.65;
      dir1.color.setHex(0x22d3ee); // Cyan key light
      dir1.intensity = 1.3;
      dir1.position.set(-3, 6, 4);
      dir2.color.setHex(0x4ade80); // Green fill light
      dir2.intensity = 0.6;
      point.color.setHex(0x06b6d4);
      point.intensity = 2.0;
    } else {
      // backwoods (default eerie dark woods) - enhanced to prevent whitewashing and show clear detailed shading
      scene.background = new THREE.Color(0x080a08);
      if (scene.fog) {
        (scene.fog as THREE.FogExp2).color.setHex(0x080a08);
      }
      ambient.color.setHex(0x647064);
      ambient.intensity = 0.8;
      dir1.color.setHex(0xfff2e0); // Warm ivory sunray key light
      dir1.intensity = 1.2;
      dir1.position.set(5, 10, 5);
      dir2.color.setHex(0x3a4f3e); // Eerie forest green ground bounce fill
      dir2.intensity = 0.6;
      point.color.setHex(0x709978); // Green pedestal underglow
      point.intensity = 1.5;
    }
  };

  // Particles generator - disabled per request
  const buildParticles = (entity: string, scene: THREE.Scene) => {
    // Remove existing if any
    if (particlesRef.current) {
      scene.remove(particlesRef.current);
      particlesRef.current = null;
    }
  };

  // Create high-quality procedural Minecraft-style fallback models
  const createProceduralModel = (entity: string, group: THREE.Group) => {
    const defaultGroup = new THREE.Group();

    if (entity === 'rot') {
      // Complex high-tech biological core with rotating outer blocks
      const coreGeo = new THREE.OctahedronGeometry(0.8, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        emissive: 0x7f1d1d,
        roughness: 0.2,
        metalness: 0.8
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.y = 1.5;
      defaultGroup.add(core);

      // Orbiting outer rings/tentacles (procedural cubes)
      for (let i = 0; i < 6; i++) {
        const orbitBoxGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const orbitBoxMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xef4444,
          roughness: 0.1
        });
        const box = new THREE.Mesh(orbitBoxGeo, orbitBoxMat);
        
        // Arrange in orbiting configuration
        const angle = (i / 6) * Math.PI * 2;
        box.position.set(Math.cos(angle) * 1.5, 1.5 + (Math.random() - 0.5) * 0.5, Math.sin(angle) * 1.5);
        defaultGroup.add(box);
      }
    } else if (entity.includes('vermis')) {
      // Wood worm segments
      for (let i = 0; i < 5; i++) {
        const size = 0.5 - i * 0.06;
        const segGeo = new THREE.BoxGeometry(size, size, size * 1.2);
        const segMat = new THREE.MeshStandardMaterial({
          color: 0x854d0e,
          roughness: 0.9,
          flatShading: true
        });
        const seg = new THREE.Mesh(segGeo, segMat);
        seg.position.set(0, 0.2, -i * 0.45 + 0.9);
        defaultGroup.add(seg);
      }
    } else if (entity === 'lignum_palus') {
      // Ultra-tall grid column stalker
      const postGeo = new THREE.BoxGeometry(0.5, 5.2, 0.5);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.y = 2.6;
      defaultGroup.add(post);

      // Glowing face nodes
      const faceGeo = new THREE.BoxGeometry(0.55, 0.3, 0.55);
      const faceMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.y = 4.8;
      defaultGroup.add(face);
    } else {
      // Biped Minecraft figure (Splinter, StiltStalker, AshWeaver etc.)
      const skinMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9, flatShading: true });
      
      // Head
      const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 2.8;
      defaultGroup.add(head);

      // Body
      const bodyGeo = new THREE.BoxGeometry(1.0, 1.4, 0.5);
      const body = new THREE.Mesh(bodyGeo, skinMat);
      body.position.y = 1.7;
      defaultGroup.add(body);

      // Left Arm
      const leftArmGeo = new THREE.BoxGeometry(0.35, 1.4, 0.35);
      const leftArm = new THREE.Mesh(leftArmGeo, skinMat);
      leftArm.position.set(0.7, 1.7, 0);
      defaultGroup.add(leftArm);

      // Right Arm
      const rightArmGeo = new THREE.BoxGeometry(0.35, 1.4, 0.35);
      const rightArm = new THREE.Mesh(rightArmGeo, skinMat);
      rightArm.position.set(-0.7, 1.7, 0);
      defaultGroup.add(rightArm);

      // Left Leg
      const leftLegGeo = new THREE.BoxGeometry(0.4, 1.0, 0.4);
      const leftLeg = new THREE.Mesh(leftLegGeo, skinMat);
      leftLeg.position.set(0.22, 0.5, 0);
      defaultGroup.add(leftLeg);

      // Right Leg
      const rightLegGeo = new THREE.BoxGeometry(0.4, 1.0, 0.4);
      const rightLeg = new THREE.Mesh(rightLegGeo, skinMat);
      rightLeg.position.set(-0.22, 0.5, 0);
      defaultGroup.add(rightLeg);
    }

    group.add(defaultGroup);
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 3, 8);
      controlsRef.current.target.set(0, 1.3, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative border border-[#1b221c] rounded-xl bg-[#060806] overflow-hidden group select-none">
      
      {/* Title block */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
          3D MODEL VIEWPORT
        </span>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#080a08]/90 z-20 flex flex-col items-center justify-center gap-4">
          <div className="w-16 bg-[#111612] h-1.5 rounded-full overflow-hidden border border-[#1a231b]">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-[#5a6b5e] uppercase tracking-widest">
            Compiling {entityName} Model... {loadProgress}%
          </span>
        </div>
      )}

      {/* Render canvas container */}
      <div 
        ref={containerRef} 
        className="w-full h-[320px] sm:h-[380px] lg:h-[420px] cursor-grab active:cursor-grabbing" 
      />

      {/* Controls Overlay Footer */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-3 bg-[#0a0d0a]/80 backdrop-blur border border-[#1b221c]/50 p-2.5 rounded-lg">
        
        {/* Render Modes */}
        <div className="flex items-center gap-1">
          {[
            { id: 'textured', label: 'Texture', icon: Sparkles },
            { id: 'wireframe', label: 'Wire', icon: FileCode }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setRenderMode(mode.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono border rounded transition-all cursor-pointer ${
                  renderMode === mode.id
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                    : 'bg-[#0a0c0a] border-[#161c17] text-[#5a6b5e] hover:text-[#c9d1c9]'
                }`}
                title={`${mode.label} Render Mode`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Setting Controls */}
        <div className="flex items-center gap-2">
          
          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 border rounded transition-all cursor-pointer ${
              autoRotate 
                ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-400' 
                : 'bg-[#0a0c0a] border-[#161c17] text-[#5a6b5e] hover:text-[#c9d1c9]'
            }`}
            title={autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>

          {/* Reset View */}
          <button
            onClick={resetCamera}
            className="p-1.5 border border-[#161c17] rounded bg-[#0a0c0a] text-[#5a6b5e] hover:text-[#c9d1c9] transition-all cursor-pointer"
            title="Reset Camera View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Diagnostics overlay in bottom-left corner of visual */}
      {diagnostics && (
        <div className="absolute top-3 right-4 bg-[#0a0c0a]/80 backdrop-blur border border-[#1b221c]/40 rounded px-2.5 py-1 text-[8px] font-mono text-[#5a6b5e] select-none flex items-center gap-3">
          <div>POLYS: <span className="text-emerald-400 font-bold">{diagnostics.polygons}</span></div>
          <div className="w-[1px] h-3.5 bg-[#1b221c]" />
          <div>VERTS: <span className="text-emerald-400 font-bold">{diagnostics.vertices}</span></div>
        </div>
      )}
    </div>
  );
}

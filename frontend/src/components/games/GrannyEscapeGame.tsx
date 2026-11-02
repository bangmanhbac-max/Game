import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Flashlight, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ShieldAlert, 
  CheckCircle, 
  ArrowLeft,
  Eye,
  Lock,
  Unlock,
  FileText,
  Volume1,
  Compass,
  Maximize2,
  Minimize2,
  Footprints,
  MousePointer,
  AlertTriangle
} from 'lucide-react';
import { VocabularyItem, LearningPackage } from '../../types/learning_content';

interface GrannyEscapeGameProps {
  vocabularyItems?: VocabularyItem[];
  packageData?: LearningPackage;
  onBackToMenu?: () => void;
  onBackToDashboard?: () => void;
  onRecordScore?: (score: number, accuracy: number, wordsDefeated: number) => void;
}

interface PaperTalismanItem {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  isTarget: boolean;
  orderIndex: number;
  roomName: string;
  floor: number;
  mesh: THREE.Group;
  collected: boolean;
  pos: THREE.Vector3;
}

interface HideWardrobe {
  id: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  doorL: THREE.Mesh;
  doorR: THREE.Mesh;
  isOpen: boolean;
  roomName: string;
  floor: number;
}

interface WallBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

export const GrannyEscapeGame: React.FC<GrannyEscapeGameProps> = ({
  vocabularyItems = [],
  packageData,
  onBackToMenu,
  onBackToDashboard,
  onRecordScore
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const handleExit = onBackToDashboard || onBackToMenu || (() => {});
  const activeItems = packageData?.vocabulary_deck.items || vocabularyItems;

  // React State for HUD & UI
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [collectedPapers, setCollectedPapers] = useState<PaperTalismanItem[]>([]);
  const [placedLocks, setPlacedLocks] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [heartbeatLevel, setHeartbeatLevel] = useState(0);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [battery] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState<'playing' | 'escaped' | 'caught'>('playing');
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [isJumpscare, setIsJumpscare] = useState(false);
  
  // Interaction Prompts State
  const [nearbyPaper, setNearbyPaper] = useState<PaperTalismanItem | null>(null);
  const [nearbyDoor, setNearbyDoor] = useState<boolean>(false);
  const [nearbyWardrobe, setNearbyWardrobe] = useState<HideWardrobe | null>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [inspectedPaper, setInspectedPaper] = useState<PaperTalismanItem | null>(null);
  const [grannyAlertMsg, setGrannyAlertMsg] = useState<string | null>(null);
  const [currentFloorName, setCurrentFloorName] = useState<string>('TẦNG 2: PHÒNG NGỦ HỒI SINH');
  const [grannyOnSameFloor, setGrannyOnSameFloor] = useState(false);
  const [isMinimapExpanded, setIsMinimapExpanded] = useState(false);

  // Active word and characters
  const activeVocab = activeItems[currentWordIndex] || activeItems[0] || {
    target_text: '你好',
    phonetic: 'nǐ hǎo',
    meaning: 'Xin chào',
    characters: ['你', '好']
  };

  const targetChars = activeVocab?.characters && activeVocab.characters.length > 0 
    ? activeVocab.characters 
    : [activeVocab?.target_text || '好'];

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // REFS FOR GAME ENGINE
  const keysRef = useRef<Record<string, boolean>>({});
  const nearbyPaperRef = useRef<PaperTalismanItem | null>(null);
  const nearbyDoorRef = useRef<boolean>(false);
  const nearbyWardrobeRef = useRef<HideWardrobe | null>(null);
  const isHidingRef = useRef<boolean>(false);
  const isJumpscareRef = useRef<boolean>(false);
  const collectedPapersRef = useRef<PaperTalismanItem[]>([]);
  const placedLocksRef = useRef<string[]>([]);
  const flashlightOnRef = useRef<boolean>(true);
  const soundEnabledRef = useRef<boolean>(true);
  const gameStateRef = useRef<'playing' | 'escaped' | 'caught'>('playing');
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 5.8, 6));
  const playerYawRef = useRef<number>(Math.PI);
  const playerFloorLevelRef = useRef<number>(2); // 2: Upper, 1: Ground, 0: Basement
  const grannyFloorLevelRef = useRef<number>(1);
  const grannyPosRef = useRef<THREE.Vector3>(new THREE.Vector3(6, 0, 2));
  const talismanItemsRef = useRef<PaperTalismanItem[]>([]);
  const wardrobesRef = useRef<HideWardrobe[]>([]);
  const wallCollidersRef = useRef<WallBox[]>([]);

  // Sync refs with React state
  useEffect(() => { flashlightOnRef.current = flashlightOn; }, [flashlightOn]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { isHidingRef.current = isHiding; }, [isHiding]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { collectedPapersRef.current = collectedPapers; }, [collectedPapers]);
  useEffect(() => { placedLocksRef.current = placedLocks; }, [placedLocks]);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // Sound Engine
  const playSfx = (type: 'creak' | 'pickup' | 'lock' | 'heartbeat' | 'alert') => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'pickup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'lock') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'heartbeat') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(48, ctx.currentTime);
        gain.gain.setValueAtTime(0.24, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.24);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'creak') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {}
  };

  // Spine-chilling periodic horror howl
  const playHorrorHowl = () => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = getAudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 1.8);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 4.2);

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(130, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(290, ctx.currentTime + 1.8);
      osc1.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 4.5);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(134, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(296, ctx.currentTime + 1.8);
      osc2.frequency.exponentialRampToValueAtTime(74, ctx.currentTime + 4.5);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.6);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 4.5);
      osc2.stop(ctx.currentTime + 4.5);
    } catch {}
  };

  // Loud jumpscare screech and heavy impact sting
  const playJumpscareSting = () => {
    if (!soundEnabledRef.current) return;
    try {
      const ctx = getAudioContext();
      // Heavy Sub Impact
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(130, ctx.currentTime);
      sub.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 0.7);
      subGain.gain.setValueAtTime(0.85, ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start();
      sub.stop(ctx.currentTime + 0.8);

      // Terrifying dissonant screech
      [420, 520, 680, 890].forEach((freq) => {
        const shriek = ctx.createOscillator();
        const sGain = ctx.createGain();
        shriek.type = 'sawtooth';
        shriek.frequency.setValueAtTime(freq, ctx.currentTime);
        shriek.frequency.exponentialRampToValueAtTime(freq * 0.35, ctx.currentTime + 1.2);
        sGain.gain.setValueAtTime(0.4, ctx.currentTime);
        sGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
        shriek.connect(sGain);
        sGain.connect(ctx.destination);
        shriek.start();
        shriek.stop(ctx.currentTime + 1.2);
      });
    } catch {}
  };

  const speakHanzi = (char: string) => {
    try {
      const utter = new SpeechSynthesisUtterance(char);
      utter.lang = 'zh-CN';
      utter.rate = 0.85;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  // Generate Vintage Talisman Paper Canvas Texture
  const createPaperTexture = (char: string, pinyin: string, isTarget: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = isTarget ? '#f5e4b8' : '#d8cfbe';
    ctx.fillRect(0, 0, 512, 768);

    ctx.strokeStyle = isTarget ? '#991b1b' : '#57534e';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 472, 728);

    ctx.strokeStyle = isTarget ? '#c2410c' : '#78716c';
    ctx.lineWidth = 4;
    ctx.strokeRect(32, 32, 448, 704);

    ctx.fillStyle = isTarget ? '#b91c1c' : '#44403c';
    ctx.fillRect(176, 50, 160, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText(isTarget ? '★ CỔ BÙA CHÚ' : 'GIẤY VỤN', 256, 82);

    ctx.fillStyle = isTarget ? '#1c1917' : '#292524';
    ctx.font = 'bold 220px "Noto Sans SC", "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 256, 360);

    ctx.fillStyle = isTarget ? '#b91c1c' : '#57534e';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText(pinyin || '', 256, 540);

    ctx.strokeStyle = isTarget ? '#9a3412' : '#78716c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 640, 50, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = isTarget ? '#9a3412' : '#78716c';
    ctx.font = 'bold 20px serif';
    ctx.fillText('GRANNY-SEAL', 256, 646);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // High-Quality Procedural Textures
  const createWoodPlankTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1c130d';
    ctx.fillRect(0, 0, 512, 512);

    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      const shade = (y / plankHeight) % 2 === 0 ? '#261910' : '#1e140d';
      ctx.fillStyle = shade;
      ctx.fillRect(0, y, 512, plankHeight - 3);

      ctx.strokeStyle = '#120b06';
      ctx.lineWidth = 1;
      for (let g = 0; g < 4; g++) {
        const gy = y + 8 + g * 14;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(150, gy + (g % 2 ? 3 : -3), 350, gy + (g % 2 ? -3 : 3), 512, gy);
        ctx.stroke();
      }

      ctx.fillStyle = '#080503';
      ctx.fillRect(0, y + plankHeight - 3, 512, 3);
      ctx.fillStyle = '#443322';
      ctx.beginPath();
      ctx.arc(20, y + 30, 2.5, 0, Math.PI * 2);
      ctx.arc(492, y + 30, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  };

  const createStoneTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#161a22';
    ctx.fillRect(0, 0, 512, 512);

    const bh = 40;
    const bw = 80;
    for (let row = 0; row < 512 / bh; row++) {
      const offsetX = (row % 2) * (bw / 2);
      for (let col = -1; col < 512 / bw + 1; col++) {
        const x = col * bw + offsetX;
        const y = row * bh;
        const tone = 26 + ((row + col) % 4) * 6;
        ctx.fillStyle = `rgb(${tone}, ${tone + 4}, ${tone + 8})`;
        ctx.fillRect(x + 2, y + 2, bw - 4, bh - 4);

        ctx.strokeStyle = '#0b0f14';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, bw, bh);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  };

  const createWallpaperTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2b231c';
    ctx.fillRect(0, 0, 512, 512);

    for (let x = 0; x < 512; x += 32) {
      ctx.fillStyle = (x / 32) % 2 === 0 ? '#382d24' : '#261e18';
      ctx.fillRect(x, 0, 16, 512);
    }

    ctx.fillStyle = 'rgba(15, 10, 5, 0.4)';
    ctx.beginPath();
    ctx.arc(120, 200, 90, 0, Math.PI * 2);
    ctx.arc(380, 400, 120, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  };

  // Actions for E and R
  const handleCollectAction = () => {
    const paper = nearbyPaperRef.current;
    if (paper && !paper.collected) {
      paper.collected = true;
      paper.mesh.visible = false;
      playSfx('pickup');
      speakHanzi(paper.char);

      const updated = [...collectedPapersRef.current, paper];
      collectedPapersRef.current = updated;
      setCollectedPapers(updated);
      setInspectedPaper(paper);
      nearbyPaperRef.current = null;
      setNearbyPaper(null);

      if (Math.random() < 0.35) {
        setGrannyAlertMsg('Granny nghe thấy tiếng sột soạt lật giấy!');
        playSfx('alert');
        setTimeout(() => setGrannyAlertMsg(null), 3500);
      }
    }
  };

  const handleDoorAction = () => {
    if (!nearbyDoorRef.current) return;
    const currentPlaced = placedLocksRef.current;
    const nextCharIndex = currentPlaced.length;
    if (nextCharIndex >= targetChars.length) return;

    const neededChar = targetChars[nextCharIndex];
    const hasPaper = collectedPapersRef.current.find((p) => p.char === neededChar && p.isTarget);

    if (hasPaper && !currentPlaced.includes(neededChar)) {
      playSfx('lock');
      const updated = [...currentPlaced, neededChar];
      placedLocksRef.current = updated;
      setPlacedLocks(updated);

      if (updated.length >= targetChars.length) {
        setTimeout(() => {
          setGameState('escaped');
          gameStateRef.current = 'escaped';
          setScore((sc) => sc + 500);
          onRecordScore?.(score + 500, 100, 1);
        }, 800);
      }
    }
  };

  const handleWardrobeAction = () => {
    if (isHidingRef.current) {
      isHidingRef.current = false;
      setIsHiding(false);
      playerPosRef.current.z += 1.4;
      playSfx('creak');
    } else if (nearbyWardrobeRef.current) {
      isHidingRef.current = true;
      setIsHiding(true);
      playerPosRef.current.copy(nearbyWardrobeRef.current.pos);
      playerPosRef.current.y += 1.4;
      playSfx('creak');
    }
  };

  // =========================================================================
  // MAIN THREE.JS 3D ENGINE EFFECT
  // =========================================================================
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.Fog(0x050811, 14, 52);

    const camera = new THREE.PerspectiveCamera(65, container.clientWidth / container.clientHeight, 0.1, 150);
    camera.position.set(0, 5.8, 6);
    playerPosRef.current.copy(camera.position);
    playerFloorLevelRef.current = 2; // Floor 2

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. ULTRA-BRIGHT FLASHLIGHT & LIGHTING
    const ambientLight = new THREE.AmbientLight(0x2a3a54, 0.75);
    scene.add(ambientLight);

    // Flashlight SpotLight (Attached to Player Camera)
    const flashlight = new THREE.SpotLight(0xfffaed, 8.5, 48, Math.PI / 4.6, 0.45, 1.1);
    flashlight.position.copy(camera.position);
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.width = 1024;
    flashlight.shadow.mapSize.height = 1024;
    scene.add(flashlight);
    scene.add(flashlight.target);

    // Ambient Floodlight around player
    const cameraFlood = new THREE.PointLight(0xffeedd, 2.4, 15);
    camera.add(cameraFlood);
    scene.add(camera);

    // Volumetric Flashlight Beam Cone
    const coneGeo = new THREE.ConeGeometry(2.6, 16, 16, 1, true);
    coneGeo.translate(0, -8, 0);
    coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffedd5,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const lightCone = new THREE.Mesh(coneGeo, coneMat);
    camera.add(lightCone);

    // Room Point Lights
    const bedroomLamp = new THREE.PointLight(0xffb74d, 1.8, 12);
    bedroomLamp.position.set(-4, 5.5, 9);
    scene.add(bedroomLamp);

    const livingBulb = new THREE.PointLight(0xffa726, 2.0, 14);
    livingBulb.position.set(0, 3.4, 0);
    scene.add(livingBulb);

    const kitchenLamp = new THREE.PointLight(0x90caf9, 1.4, 11);
    kitchenLamp.position.set(-7, 3.2, -6);
    scene.add(kitchenLamp);

    const basementTorch1 = new THREE.PointLight(0xff7043, 2.4, 12);
    basementTorch1.position.set(4, -2.5, -8);
    scene.add(basementTorch1);

    const basementTorch2 = new THREE.PointLight(0xff7043, 2.4, 12);
    basementTorch2.position.set(-6, -2.5, 6);
    scene.add(basementTorch2);

    // Floating Dust Particles
    const dustCount = 200;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 22;
      dustPositions[i + 1] = Math.random() * 10 - 3;
      dustPositions[i + 2] = (Math.random() - 0.5) * 22;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfff3d6,
      size: 0.08,
      transparent: true,
      opacity: 0.5
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // =========================================================================
    // 3. ARCHITECTURAL 3-FLOOR HOUSE & SOLID WALL COLLIDERS
    // =========================================================================
    const houseGroup = new THREE.Group();
    const wallColliders: WallBox[] = [];

    const floorWoodMat = new THREE.MeshStandardMaterial({ 
      map: createWoodPlankTexture(), 
      roughness: 0.75 
    });
    const wallPaperMat = new THREE.MeshStandardMaterial({ 
      map: createWallpaperTexture(), 
      roughness: 0.85 
    });
    const stoneBasementMat = new THREE.MeshStandardMaterial({ 
      map: createStoneTexture(), 
      roughness: 0.95 
    });
    const woodPropMat = new THREE.MeshStandardMaterial({ color: 0x382214, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.35 });

    const makeFloor = (x: number, y: number, z: number, w: number, d: number, mat = floorWoodMat) => {
      const geo = new THREE.BoxGeometry(w, 0.25, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      houseGroup.add(mesh);
      return mesh;
    };

    // Helper: Add Wall with Solid Box Collision Box
    const makeWall = (x: number, y: number, z: number, w: number, h: number, d: number, mat = wallPaperMat, collidable = true) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      houseGroup.add(mesh);

      if (collidable) {
        wallColliders.push({
          minX: x - w / 2,
          maxX: x + w / 2,
          minZ: z - d / 2,
          maxZ: z + d / 2,
          minY: y,
          maxY: y + h
        });
      }
      return mesh;
    };

    // Helper: Register furniture collider
    const addPropCollider = (x: number, y: number, z: number, w: number, h: number, d: number) => {
      wallColliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        minY: y,
        maxY: y + h
      });
    };

    // --- TẦNG HẦM (BASEMENT: Y = -4.2) ---
    makeFloor(0, -4.2, 0, 24, 24, stoneBasementMat);
    makeWall(0, -4.2, -12, 24, 4.2, 0.6, stoneBasementMat);
    makeWall(0, -4.2, 12, 24, 4.2, 0.6, stoneBasementMat);
    makeWall(-12, -4.2, 0, 0.6, 4.2, 24, stoneBasementMat);
    makeWall(12, -4.2, 0, 0.6, 4.2, 24, stoneBasementMat);

    // Prison Cell in Basement
    for (let bx = -10; bx <= -4; bx += 0.8) {
      const ironBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2), metalMat);
      ironBar.position.set(bx, -2.1, -4);
      houseGroup.add(ironBar);
    }
    makeWall(-4, -4.2, -7.5, 0.4, 4.2, 7, stoneBasementMat);
    addPropCollider(-7, -4.2, -4, 6, 4.2, 0.4);

    // --- TẦNG 1 (GROUND FLOOR: Y = 0.0) ---
    // Floor with stairwell cutout to basement
    makeFloor(3, 0, 0, 18, 24, floorWoodMat);
    makeFloor(-9, 0, -8, 6, 8, floorWoodMat);
    makeFloor(-9, 0, 9.5, 6, 5, floorWoodMat);

    // Outer Walls
    makeWall(0, 0, -12, 24, 4.2, 0.5);
    makeWall(-12, 0, 0, 0.5, 4.2, 24);
    makeWall(12, 0, 0, 0.5, 4.2, 24);
    makeWall(-6.5, 0, 12, 11, 4.2, 0.5);
    makeWall(6.5, 0, 12, 11, 4.2, 0.5);
    makeWall(0, 3.2, 12, 2.5, 1.0, 0.5);

    // Ground Floor Partitions with Open Doorways
    makeWall(-4, 0, -8, 0.4, 4.2, 8, wallPaperMat); // Kitchen back wall (leaves doorway at Z = -4 to 0)
    makeWall(4, 0, 6, 0.4, 4.2, 8, wallPaperMat);   // Living room front wall (leaves doorway at Z = 2 to -2)

    // Railing around Basement Stairwell
    const banisterMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.7 });
    const bRailR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 8.5), banisterMat);
    bRailR.position.set(-6.1, 0.5, 2.2);
    const bRailBack = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.0, 0.12), banisterMat);
    bRailBack.position.set(-9.0, 0.5, 6.5);
    houseGroup.add(bRailR, bRailBack);
    addPropCollider(-6.1, 0, 2.2, 0.4, 1.5, 8.5);
    addPropCollider(-9.0, 0, 6.5, 5.8, 1.5, 0.4);

    // Front Exit Door
    const exitDoorGroup = new THREE.Group();
    exitDoorGroup.position.set(0, 0, 12);
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.18), new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.65 }));
    doorLeaf.position.set(0, 1.6, 0);
    doorLeaf.castShadow = true;
    exitDoorGroup.add(doorLeaf);

    [2.4, 1.6, 0.8].forEach((barY) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.14, 0.22), metalMat);
      bar.position.set(0, barY, 0.12);
      exitDoorGroup.add(bar);
    });

    targetChars.forEach((_, idx) => {
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        emissive: 0xef4444,
        emissiveIntensity: 0.35
      });
      const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.05), plaqueMat);
      const posX = (idx - (targetChars.length - 1) / 2) * 0.7;
      plaque.position.set(posX, 1.6, 0.18);
      exitDoorGroup.add(plaque);
    });
    houseGroup.add(exitDoorGroup);

    // --- TẦNG 2 (UPPER FLOOR: Y = 4.2) ---
    makeFloor(-3, 4.2, 0, 18, 24, floorWoodMat);
    makeFloor(9, 4.2, 5.5, 6, 13, floorWoodMat);
    makeFloor(9, 4.2, -11.5, 6, 1, floorWoodMat);
    makeFloor(0, 8.4, 0, 24, 24, floorWoodMat);

    makeWall(0, 4.2, -12, 24, 4.2, 0.5);
    makeWall(0, 4.2, 12, 24, 4.2, 0.5);
    makeWall(-12, 4.2, 0, 0.5, 4.2, 24);
    makeWall(12, 4.2, 0, 0.5, 4.2, 24);

    // Upper Floor Partitions with Open Doorways
    makeWall(-5.5, 4.2, 4, 7, 4.2, 0.35, wallPaperMat); // Bedroom partition left (leaves doorway at X = -2 to 1)
    makeWall(4, 4.2, -6, 0.35, 4.2, 8, wallPaperMat);   // Bathroom partition (leaves doorway at Z = -2 to 2)

    // Railing around Stairwell Cutout at Floor 2
    const uRailL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 8.5), banisterMat);
    uRailL.position.set(6.2, 4.7, -5.8);
    const uRailFront = new THREE.Mesh(new THREE.BoxGeometry(5.8, 1.0, 0.12), banisterMat);
    uRailFront.position.set(9.0, 4.7, -1.5);
    houseGroup.add(uRailL, uRailFront);
    addPropCollider(6.2, 4.2, -5.8, 0.4, 1.5, 8.5);
    addPropCollider(9.0, 4.2, -1.5, 5.8, 1.5, 0.4);

    // =========================================================================
    // 4. BROAD STAIRWAYS (GROUND TO UPPER & GROUND TO BASEMENT)
    // =========================================================================
    for (let s = 0; s < 14; s++) {
      const stepT = s / 13;
      const stepY = stepT * 3.9 + 0.15;
      const stepZ = -2.0 - stepT * 7.6;
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 0.65), floorWoodMat);
      step.position.set(8.2, stepY, stepZ);
      step.receiveShadow = true;
      houseGroup.add(step);
    }

    for (let s = 0; s < 14; s++) {
      const stepT = s / 13;
      const stepY = -stepT * 3.9 - 0.15;
      const stepZ = -2.0 + stepT * 7.8;
      const step = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, 0.65), stoneBasementMat);
      step.position.set(-8.2, stepY, stepZ);
      step.receiveShadow = true;
      houseGroup.add(step);
    }

    // =========================================================================
    // 5. EXTENSIVE FURNISHINGS & HORROR PROPS (RICH ROOM CLUTTER)
    // =========================================================================
    const wardrobes: HideWardrobe[] = [];

    const makeWardrobe = (id: string, x: number, y: number, z: number, floor: number, roomName: string) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(x, y, z);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x2e1a0e, roughness: 0.8 });
      const wBox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 0.9), frameMat);
      wBox.position.set(0, 1.3, 0);
      wGroup.add(wBox);

      const doorMat = new THREE.MeshStandardMaterial({ color: 0x3f2314, roughness: 0.7 });
      const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.74, 2.4, 0.05), doorMat);
      doorL.position.set(-0.38, 1.3, 0.46);
      const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.74, 2.4, 0.05), doorMat);
      doorR.position.set(0.38, 1.3, 0.46);
      wGroup.add(doorL, doorR);

      houseGroup.add(wGroup);

      const wObj: HideWardrobe = {
        id,
        mesh: wGroup,
        pos: new THREE.Vector3(x, y, z),
        doorL,
        doorR,
        isOpen: false,
        roomName,
        floor
      };
      wardrobes.push(wObj);
      addPropCollider(x, y, z, 1.8, 2.6, 1.1);

      return wObj;
    };

    makeWardrobe('w-bedroom', -8, 4.2, 8, 2, 'Phòng Ngủ Tầng 2');
    makeWardrobe('w-living', 8, 0, 6, 1, 'Phòng Khách Tầng 1');

    // 1) Spawn Bedroom Props (Tầng 2)
    const bedGroup = new THREE.Group();
    bedGroup.position.set(0, 4.2, 9);
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 3.4), woodPropMat);
    bedFrame.position.y = 0.25;
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 3.1), new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.9 }));
    mattress.position.y = 0.6;
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 0.6), new THREE.MeshStandardMaterial({ color: 0x881337, roughness: 0.85 }));
    pillow.position.set(0, 0.85, -1.0);
    bedGroup.add(bedFrame, mattress, pillow);
    houseGroup.add(bedGroup);
    addPropCollider(0, 4.2, 9, 2.8, 1.2, 3.6);

    // Bedside Nightstands with Candlesticks
    const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), woodPropMat);
    nightstand.position.set(-4, 4.65, 9);
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.4), metalMat);
    lampBase.position.set(-4, 5.2, 9);
    const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.35, 8), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 }));
    lampShade.position.set(-4, 5.5, 9);
    houseGroup.add(nightstand, lampBase, lampShade);
    addPropCollider(-4, 4.2, 9, 1.1, 1.2, 1.1);

    // Writing Desk & Vintage Chair in Bedroom
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.1), woodPropMat);
    desk.position.set(-8, 4.7, 4.5);
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 0.7), woodPropMat);
    chair.position.set(-8, 4.75, 3.2);
    houseGroup.add(desk, chair);
    addPropCollider(-8, 4.2, 4.5, 2.4, 1.2, 1.3);

    // Bookshelf with Human Skull
    const bookshelf = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.0, 0.7), woodPropMat);
    bookshelf.position.set(3, 5.7, 9);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 }));
    skull.position.set(3, 6.6, 9.1);
    houseGroup.add(bookshelf, skull);
    addPropCollider(3, 4.2, 9, 2.4, 3.0, 0.9);

    // Vintage Luggage Trunk at foot of bed
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.8), woodPropMat);
    trunk.position.set(0, 4.55, 6.7);
    houseGroup.add(trunk);
    addPropCollider(0, 4.2, 6.7, 1.8, 0.8, 1.0);

    // 2) Bathroom Props (Tầng 2)
    const bathtub = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 2.8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 }));
    bathtub.position.set(-8, 4.65, -8);
    const toilet = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 1.0), new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.5 }));
    toilet.position.set(-4, 4.75, -10.5);
    houseGroup.add(bathtub, toilet);
    addPropCollider(-8, 4.2, -8, 1.7, 1.0, 3.0);

    // 3) Living Room Props (Tầng 1)
    // Stone Fireplace with glowing embers
    const fireplace = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 1.2), stoneBasementMat);
    fireplace.position.set(0, 1.4, -11.3);
    const emberMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff2200, emissiveIntensity: 0.8 });
    const embers = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.6), emberMat);
    embers.position.set(0, 0.2, -11.0);
    houseGroup.add(fireplace, embers);
    addPropCollider(0, 0, -11.3, 3.4, 2.8, 1.4);

    // TV Set on Wooden Cabinet
    const tvGroup = new THREE.Group();
    tvGroup.position.set(8, 0, -2);
    const tvTable = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.9), woodPropMat);
    tvTable.position.y = 0.4;
    const tvScreen = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.5), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, emissive: 0x1e3a8a, emissiveIntensity: 0.3 }));
    tvScreen.position.y = 1.3;
    tvGroup.add(tvTable, tvScreen);
    houseGroup.add(tvGroup);
    addPropCollider(8, 0, -2, 2.2, 1.8, 1.1);

    // Sofa & Coffee Table
    const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.9, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 }));
    sofa.position.set(8, 0.45, 2);
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.0), woodPropMat);
    coffeeTable.position.set(5.5, 0.25, 2);
    houseGroup.add(sofa, coffeeTable);
    addPropCollider(8, 0, 2, 2.8, 1.0, 1.4);
    addPropCollider(5.5, 0, 2, 1.8, 0.6, 1.2);

    // Grandfather Clock
    const clockGroup = new THREE.Group();
    clockGroup.position.set(11, 0, 8);
    const clockBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.2, 0.6), woodPropMat);
    clockBody.position.y = 1.6;
    const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0xfef3c7 }));
    clockFace.rotation.x = Math.PI / 2;
    clockFace.position.set(0, 2.6, 0.32);
    clockGroup.add(clockBody, clockFace);
    houseGroup.add(clockGroup);
    addPropCollider(11, 0, 8, 1.0, 3.2, 0.8);

    // 4) Kitchen & Dining Props (Tầng 1)
    const tableGroup = new THREE.Group();
    tableGroup.position.set(-7, 0, -6);
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.15, 2.0), woodPropMat);
    tableTop.position.y = 1.0;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);
    [[-1.6, -0.8], [1.6, -0.8], [-1.6, 0.8], [1.6, 0.8]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0), woodPropMat);
      leg.position.set(lx, 0.5, lz);
      tableGroup.add(leg);
    });
    // Bloody Cleaver on Kitchen Table
    const knife = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.5), metalMat);
    knife.position.set(0, 1.1, 0);
    tableGroup.add(knife);
    houseGroup.add(tableGroup);
    addPropCollider(-7, 0, -6, 3.8, 1.2, 2.2);

    // Kitchen Counter & Retro Fridge
    const counter = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.1, 4.0), woodPropMat);
    counter.position.set(-10.8, 0.55, -8);
    const fridge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.4, 1.1), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 }));
    fridge.position.set(-10.8, 1.2, -4);
    houseGroup.add(counter, fridge);
    addPropCollider(-10.8, 0, -6, 1.4, 2.4, 5.5);

    // 5) Basement Props (Tầng Hầm)
    // Carpenter Workbench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 1.6), woodPropMat);
    bench.position.set(0, -3.7, -8);
    houseGroup.add(bench);
    addPropCollider(0, -4.2, -8, 3.8, 1.2, 1.8);

    // Skeleton prop inside Dungeon Cell
    const skeleton = new THREE.Group();
    skeleton.position.set(-7, -4.0, -7);
    const skHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xecd9c6 }));
    skHead.position.set(0, 0.5, 0);
    const skRibs = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0xecd9c6 }));
    skRibs.position.set(0, 0, 0);
    skeleton.add(skHead, skRibs);
    houseGroup.add(skeleton);

    // Barrels & Wooden Shipping Crates
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const crate1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), crateMat);
    crate1.position.set(8, -3.6, 8);
    const crate2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), crateMat);
    crate2.position.set(8.2, -2.5, 8);
    const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.4, 10), woodPropMat);
    barrel1.position.set(6.2, -3.5, 8.5);
    const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 1.4, 10), woodPropMat);
    barrel2.position.set(6.2, -3.5, 6.8);
    houseGroup.add(crate1, crate2, barrel1, barrel2);
    addPropCollider(7.2, -4.2, 7.8, 3.2, 2.5, 3.2);

    scene.add(houseGroup);
    wardrobesRef.current = wardrobes;
    wallCollidersRef.current = wallColliders;

    // =========================================================================
    // 6. MẢNH GIẤY BÙA CỔ TỰ (HANZI TALISMAN PAPER SCRAPS)
    // =========================================================================
    const talismanItems: PaperTalismanItem[] = [];

    const spawnLocations = [
      { pos: new THREE.Vector3(-7, 1.25, -6), room: 'Bàn Ăn Nhà Bếp (Tầng 1)', floor: 1 },
      { pos: new THREE.Vector3(0, 5.25, 9), room: 'Đầu Giường Phòng Ngủ (Tầng 2)', floor: 2 },
      { pos: new THREE.Vector3(0, -2.9, -8), room: 'Bàn Thợ Mộc (Tầng Hầm)', floor: 0 },
      { pos: new THREE.Vector3(5.5, 0.75, 2), room: 'Bàn Trà Phòng Khách (Tầng 1)', floor: 1 },
      { pos: new THREE.Vector3(-7, -3.2, -7), room: 'Ngục Giam Khung Xương (Tầng Hầm)', floor: 0 },
      { pos: new THREE.Vector3(3, 5.9, 9), room: 'Kệ Sách Cổ Tầng 2', floor: 2 },
      { pos: new THREE.Vector3(-8, 5.25, 4.5), room: 'Bàn Viết Cổ Điển (Tầng 2)', floor: 2 }
    ];

    const decoyChars = ['坏', '怪', '危', '险', '逃', '锁', '鬼'];

    targetChars.forEach((ch, idx) => {
      const loc = spawnLocations[idx % spawnLocations.length];
      const pinyin = activeVocab?.phonetic?.split(' ')[idx] || '';
      const texture = createPaperTexture(ch, pinyin, true);

      const paperGroup = new THREE.Group();
      paperGroup.position.copy(loc.pos);

      const paperGeo = new THREE.BoxGeometry(0.7, 1.0, 0.03);
      const paperMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.6,
        metalness: 0.1,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.25
      });
      const paperMesh = new THREE.Mesh(paperGeo, paperMat);
      paperMesh.rotation.x = -Math.PI / 4;
      paperGroup.add(paperMesh);

      const pLight = new THREE.PointLight(0xf59e0b, 1.4, 4.0);
      pLight.position.set(0, 0.35, 0);
      paperGroup.add(pLight);

      scene.add(paperGroup);

      talismanItems.push({
        id: `paper-target-${idx}`,
        char: ch,
        pinyin,
        meaning: activeVocab?.meaning || '',
        isTarget: true,
        orderIndex: idx,
        roomName: loc.room,
        floor: loc.floor,
        mesh: paperGroup,
        collected: false,
        pos: loc.pos.clone()
      });
    });

    decoyChars.slice(0, 3).forEach((decoyCh, dIdx) => {
      const loc = spawnLocations[(targetChars.length + dIdx) % spawnLocations.length];
      const texture = createPaperTexture(decoyCh, '', false);

      const paperGroup = new THREE.Group();
      paperGroup.position.copy(loc.pos);

      const paperGeo = new THREE.BoxGeometry(0.65, 0.9, 0.03);
      const paperMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.05
      });
      const paperMesh = new THREE.Mesh(paperGeo, paperMat);
      paperMesh.rotation.x = -Math.PI / 3;
      paperGroup.add(paperMesh);

      scene.add(paperGroup);

      talismanItems.push({
        id: `paper-decoy-${dIdx}`,
        char: decoyCh,
        pinyin: '',
        meaning: 'Chữ không khớp bùa',
        isTarget: false,
        orderIndex: -1,
        roomName: loc.room,
        floor: loc.floor,
        mesh: paperGroup,
        collected: false,
        pos: loc.pos.clone()
      });
    });

    talismanItemsRef.current = talismanItems;

    // =========================================================================
    // 7. TERRIFYING HORROR GRANNY ENTITY & JUMPSCARE RIGGING
    // =========================================================================
    const grannyGroup = new THREE.Group();
    grannyGroup.position.set(6, 0, 2);
    grannyFloorLevelRef.current = 1;

    // Decaying bloodstained gown
    const gownMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.95 });
    const gown = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.95, 2.5, 12), gownMat);
    gown.position.y = 1.25;
    gown.castShadow = true;

    // Twisted Hunch Spine
    const hunch = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), gownMat);
    hunch.position.set(0, 2.2, -0.32);

    // Terrifying decaying head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.6, 0.15);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xc8c3bc, roughness: 0.95 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), headMat);
    headGroup.add(head);

    // Gaping dislocated bloody jaw & needle teeth
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x450a0a });
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.12), mouthMat);
    mouth.position.set(0, -0.15, 0.35);
    headGroup.add(mouth);

    // Glowing Blood-Red Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat);
    eyeL.position.set(-0.14, 0.05, 0.35);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), eyeMat);
    eyeR.position.set(0.14, 0.05, 0.35);
    headGroup.add(eyeL, eyeR);

    // Red warning aura point light (ominous crimson shadow)
    const grannyAuraLight = new THREE.PointLight(0xff0033, 2.5, 6.0);
    grannyAuraLight.position.set(0, 0.05, 0.5);
    headGroup.add(grannyAuraLight);

    // Stringy White Hair
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.95 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), hairMat);
    hair.position.set(0, 0.1, -0.15);
    headGroup.add(hair);

    // Right Arm holding Bloody Bat with 3D Nails
    const armGroup = new THREE.Group();
    armGroup.position.set(0.7, 1.8, 0.2);
    const batMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const bat = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.6, 8), batMat);
    bat.rotation.x = -Math.PI / 4;
    bat.position.set(0, 0.3, 0.4);

    // 4 Sharp Metal Nails poking through the bat
    [-0.3, -0.1, 0.1, 0.3].forEach((ny) => {
      const nail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35), metalMat);
      nail.rotation.z = Math.PI / 2;
      nail.position.set(0, 0.3 + ny, 0.4);
      armGroup.add(nail);
    });
    armGroup.add(bat);

    grannyGroup.add(gown, hunch, headGroup, armGroup);
    scene.add(grannyGroup);

    // Granny Multi-Floor Patrol Nodes
    const patrolNodes = [
      { pos: new THREE.Vector3(5, 0, 2), floor: 1, name: 'Phòng Khách Tầng 1' },
      { pos: new THREE.Vector3(0, 0, 7), floor: 1, name: 'Sảnh Cửa Chính' },
      { pos: new THREE.Vector3(-6, 0, -5), floor: 1, name: 'Bếp Ăn Tầng 1' },
      { pos: new THREE.Vector3(0, 4.2, 7), floor: 2, name: 'Phòng Ngủ Tầng 2' },
      { pos: new THREE.Vector3(-5, 4.2, -1), floor: 2, name: 'Phòng Tắm Tầng 2' },
      { pos: new THREE.Vector3(5, 4.2, 6), floor: 2, name: 'Hành Lang Tầng 2' },
      { pos: new THREE.Vector3(0, -4.2, -6), floor: 0, name: 'Bàn Thợ Mộc Hầm' },
      { pos: new THREE.Vector3(-6, -4.2, -3), floor: 0, name: 'Phòng Giam Hầm' },
      { pos: new THREE.Vector3(6, -4.2, 4), floor: 0, name: 'Kho Thùng Hầm' }
    ];
    let patrolIdx = 0;
    let grannySpeed = 0.028;

    // Periodic Horror Howl Timer (Triggers every 30-45 seconds)
    let lastHowlTime = Date.now() + 15000;

    // =========================================================================
    // 8. INPUT CONTROLS, POINTER LOCK & SMOOTH LOOK
    // =========================================================================
    let isMouseDown = false;
    let yaw = Math.PI;
    let pitch = 0;
    let bobbingTimer = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;

      if (key === 'f') {
        setFlashlightOn((prev) => !prev);
        playSfx('creak');
      }

      if (key === 'r') {
        handleWardrobeAction();
      }

      if (key === 'e') {
        if (nearbyPaperRef.current) {
          handleCollectAction();
        } else if (nearbyDoorRef.current) {
          handleDoorAction();
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === container;
      setIsPointerLocked(locked);
    };

    const onCanvasClick = () => {
      if (document.pointerLockElement !== container) {
        container.requestPointerLock?.();
      }
    };

    const onMouseDown = () => { isMouseDown = true; };
    const onMouseUp = () => { isMouseDown = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === container || isMouseDown) {
        yaw -= e.movementX * 0.0022;
        pitch -= e.movementY * 0.0022;
        pitch = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, pitch));
        playerYawRef.current = yaw;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    container.addEventListener('click', onCanvasClick);
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // =========================================================================
    // 9. CONTINUOUS CIRCLE-TO-AABB WALL COLLISION (NO CLIPPING THROUGH WALLS!)
    // =========================================================================
    const resolveCollisions = (pos: THREE.Vector3) => {
      const radius = 0.45; // Player collision radius

      for (const box of wallColliders) {
        // Check if player Y is in the vertical range of this wall/prop
        if (pos.y >= box.minY - 0.2 && pos.y <= box.maxY + 0.2) {
          // Find closest point on AABB to player center
          const closeX = Math.max(box.minX, Math.min(pos.x, box.maxX));
          const closeZ = Math.max(box.minZ, Math.min(pos.z, box.maxZ));

          const dx = pos.x - closeX;
          const dz = pos.z - closeZ;
          const distSq = dx * dx + dz * dz;

          if (distSq < radius * radius && distSq > 0.00001) {
            // Push player circle out along contact normal
            const dist = Math.sqrt(distSq);
            const pen = radius - dist;
            pos.x += (dx / dist) * pen;
            pos.z += (dz / dist) * pen;
          } else if (distSq <= 0.00001 && pos.x >= box.minX && pos.x <= box.maxX && pos.z >= box.minZ && pos.z <= box.maxZ) {
            // Player completely inside box, push out to closest edge
            const dL = Math.abs(pos.x - box.minX);
            const dR = Math.abs(box.maxX - pos.x);
            const dT = Math.abs(pos.z - box.minZ);
            const dB = Math.abs(box.maxZ - pos.z);
            const minEdge = Math.min(dL, dR, dT, dB);
            if (minEdge === dL) pos.x = box.minX - radius;
            else if (minEdge === dR) pos.x = box.maxX + radius;
            else if (minEdge === dT) pos.z = box.minZ - radius;
            else pos.z = box.maxZ + radius;
          }
        }
      }
    };

    // =========================================================================
    // 10. GAME ANIMATION LOOP
    // =========================================================================
    let animId = 0;
    let heartbeatTick = 0;
    const raycaster = new THREE.Raycaster();

    const animate = () => {
      // Periodic Horror Howl Sound Effect (Thi thoảng có tiếng hú rợn người)
      const now = Date.now();
      if (now - lastHowlTime > 32000) {
        lastHowlTime = now + (Math.random() * 14000); // 32 - 46 seconds interval
        playHorrorHowl();
        setGrannyAlertMsg('Tiếng hú ma quái rợn người vọng qua các hành lang lạnh buốt...');
        setTimeout(() => setGrannyAlertMsg(null), 4000);
      }

      // Camera Look Rotation
      if (!isJumpscareRef.current) {
        camera.rotation.set(0, 0, 0);
        camera.rotateY(yaw);
        camera.rotateX(pitch);
      }

      // Flashlight Follow
      flashlight.position.copy(camera.position);
      flashlight.visible = flashlightOnRef.current;
      cameraFlood.visible = flashlightOnRef.current;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      flashlight.target.position.copy(camera.position).add(forward.clone().multiplyScalar(10));

      if (Math.random() < 0.02) {
        livingBulb.intensity = 0.5 + Math.random() * 1.5;
      }

      // Player Movement & Solid Wall Collisions
      if (gameStateRef.current === 'playing' && !isHidingRef.current && !isJumpscareRef.current) {
        const isSprinting = keysRef.current['shift'];
        const moveSpeed = isSprinting ? 0.072 : 0.042;
        const dir = new THREE.Vector3();

        if (keysRef.current['w']) dir.z -= 1;
        if (keysRef.current['s']) dir.z += 1;
        if (keysRef.current['a']) dir.x -= 1;
        if (keysRef.current['d']) dir.x += 1;

        if (dir.lengthSq() > 0) {
          dir.normalize();
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

          camera.position.x += dir.x * moveSpeed;
          camera.position.z += dir.z * moveSpeed;

          // FIRM WALL & PROP COLLISION RESOLUTION (NEVER GO THROUGH WALLS!)
          resolveCollisions(camera.position);

          bobbingTimer += isSprinting ? 0.22 : 0.14;
          camera.position.y += Math.sin(bobbingTimer) * 0.015;

          if (isSprinting && Math.random() < 0.035) {
            setGrannyAlertMsg('Granny nghe thấy tiếng bước chân chạy dồn dập!');
            playSfx('alert');
            setTimeout(() => setGrannyAlertMsg(null), 3000);
          }
        }

        // Clamp camera inside outer walls
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -11.0, 11.0);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -11.0, 11.2);

        // Stairway elevation transitions
        const inUpperStairs = (camera.position.x >= 6.2 && camera.position.x <= 10.5 && camera.position.z <= -1.8 && camera.position.z >= -10.2);
        const inBasementStairs = (camera.position.x >= -10.5 && camera.position.x <= -6.2 && camera.position.z >= -2.2 && camera.position.z <= 6.5);

        let targetY = 5.8;

        if (inUpperStairs) {
          const stairT = THREE.MathUtils.clamp((-2.0 - camera.position.z) / 7.8, 0, 1);
          targetY = 1.6 + stairT * 4.2;
          camera.position.y += (targetY - camera.position.y) * 0.25;

          if (stairT > 0.8) playerFloorLevelRef.current = 2;
          else if (stairT < 0.2) playerFloorLevelRef.current = 1;
        } else if (inBasementStairs) {
          const stairT = THREE.MathUtils.clamp((camera.position.z - (-2.0)) / 8.0, 0, 1);
          targetY = 1.6 - stairT * 4.2;
          camera.position.y += (targetY - camera.position.y) * 0.25;

          if (stairT > 0.8) playerFloorLevelRef.current = 0;
          else if (stairT < 0.2) playerFloorLevelRef.current = 1;
        } else {
          if (playerFloorLevelRef.current === 2) targetY = 5.8;
          else if (playerFloorLevelRef.current === 0) targetY = -2.6;
          else targetY = 1.6;

          camera.position.y += (targetY - camera.position.y) * 0.2;
        }

        playerPosRef.current.copy(camera.position);

        if (playerFloorLevelRef.current === 2) setCurrentFloorName('TẦNG 2: PHÒNG NGỦ HỒI SINH');
        else if (playerFloorLevelRef.current === 1) setCurrentFloorName('TẦNG 1: SẢNH CHÍNH & NHÀ BẾP');
        else setCurrentFloorName('TẦNG HẦM: NGỤC TỐI & BÀN THỢ MỘC');
      }

      // Talisman Paper Animation
      talismanItems.forEach((t) => {
        if (!t.collected) {
          t.mesh.rotation.y += 0.015;
          t.mesh.position.y = t.pos.y + Math.sin(Date.now() * 0.003 + t.orderIndex) * 0.08;
        }
      });

      // Raycasting Crosshair Interaction
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      let foundNearbyPaper: PaperTalismanItem | null = null;

      talismanItems.forEach((t) => {
        if (!t.collected) {
          const dist = camera.position.distanceTo(t.mesh.position);
          if (dist < 3.2) {
            foundNearbyPaper = t;
          }
        }
      });
      nearbyPaperRef.current = foundNearbyPaper;
      setNearbyPaper(foundNearbyPaper);

      const distToFrontDoor = camera.position.distanceTo(new THREE.Vector3(0, 1.6, 12));
      const isNearDoor = distToFrontDoor < 3.6 && playerFloorLevelRef.current === 1;
      nearbyDoorRef.current = isNearDoor;
      setNearbyDoor(isNearDoor);

      let foundWardrobe: HideWardrobe | null = null;
      wardrobes.forEach((w) => {
        if (camera.position.distanceTo(w.pos) < 3.0 && playerFloorLevelRef.current === w.floor) {
          foundWardrobe = w;
        }
      });
      nearbyWardrobeRef.current = foundWardrobe;
      setNearbyWardrobe(foundWardrobe);

      // Granny AI & Jumpscare Trigger
      if (gameStateRef.current === 'playing') {
        const currentNode = patrolNodes[patrolIdx];
        grannyFloorLevelRef.current = currentNode.floor;

        const isSameFloor = (playerFloorLevelRef.current === grannyFloorLevelRef.current);
        setGrannyOnSameFloor(isSameFloor);

        const dist2D = Math.hypot(camera.position.x - grannyGroup.position.x, camera.position.z - grannyGroup.position.z);
        const verticalDiff = Math.abs(camera.position.y - (grannyGroup.position.y + 1.6));

        grannyPosRef.current.copy(grannyGroup.position);

        let fear = 0;
        if (isSameFloor || verticalDiff < 3.0) {
          fear = Math.max(0, Math.min(100, Math.round((1 - dist2D / 16) * 100)));
        }
        setHeartbeatLevel(fear);

        heartbeatTick++;
        if (fear > 30 && heartbeatTick % (fear > 70 ? 25 : 45) === 0) {
          playSfx('heartbeat');
        }

        // Terrifying Jumpscare Trigger!
        if (isSameFloor && verticalDiff < 2.0 && dist2D < 1.8 && !isHidingRef.current && !isJumpscareRef.current) {
          isJumpscareRef.current = true;
          setIsJumpscare(true);
          playJumpscareSting();

          // Camera locks onto Granny's terrifying face
          camera.lookAt(grannyGroup.position.x, grannyGroup.position.y + 2.5, grannyGroup.position.z);

          // Violent camera shake & Granny bat swing
          let shakeCount = 0;
          const shakeInterval = setInterval(() => {
            shakeCount++;
            camera.position.x += (Math.random() - 0.5) * 0.25;
            camera.position.y += (Math.random() - 0.5) * 0.25;
            armGroup.rotation.x = Math.PI / 2 + Math.sin(shakeCount) * 0.6;

            if (shakeCount > 24) {
              clearInterval(shakeInterval);
              setIsJumpscare(false);
              setGameState('caught');
              gameStateRef.current = 'caught';
            }
          }, 45);
        }

        // Granny Head Twitching & Breathing Animation
        headGroup.rotation.z = Math.sin(Date.now() * 0.012) * 0.2;
        headGroup.rotation.x = Math.sin(Date.now() * 0.008) * 0.15;

        // Destination: Chase player if on same floor
        let dest = currentNode.pos;
        if (isSameFloor && dist2D < 9.5 && !isHidingRef.current) {
          dest = camera.position;
          grannySpeed = 0.052;
        } else {
          grannySpeed = 0.026;
          const distToNode = Math.hypot(dest.x - grannyGroup.position.x, dest.z - grannyGroup.position.z);
          if (distToNode < 1.8) {
            patrolIdx = (patrolIdx + 1) % patrolNodes.length;
          }
        }

        const gDir = new THREE.Vector3().subVectors(dest, grannyGroup.position);
        gDir.y = 0;
        if (gDir.lengthSq() > 0) {
          gDir.normalize();
          grannyGroup.position.x += gDir.x * grannySpeed;
          grannyGroup.position.z += gDir.z * grannySpeed;
          const targetGrannyY = (grannyFloorLevelRef.current === 2 ? 4.2 : grannyFloorLevelRef.current === 0 ? -4.2 : 0.0);
          grannyGroup.position.y += (targetGrannyY - grannyGroup.position.y) * 0.15;
          grannyGroup.rotation.y = Math.atan2(gDir.x, gDir.z);

          bat.rotation.x = Math.sin(Date.now() * 0.008) * 0.35;
        }
      }

      // Render 2D Minimap Radar
      const minimapCanvas = minimapCanvasRef.current;
      if (minimapCanvas) {
        const mCtx = minimapCanvas.getContext('2d');
        if (mCtx) {
          const w = minimapCanvas.width;
          const h = minimapCanvas.height;
          mCtx.clearRect(0, 0, w, h);

          mCtx.fillStyle = '#060913';
          mCtx.fillRect(0, 0, w, h);

          mCtx.strokeStyle = '#1e293b';
          mCtx.lineWidth = 1;
          for (let gx = 0; gx < w; gx += 20) {
            mCtx.beginPath();
            mCtx.moveTo(gx, 0);
            mCtx.lineTo(gx, h);
            mCtx.stroke();
          }
          for (let gy = 0; gy < h; gy += 20) {
            mCtx.beginPath();
            mCtx.moveTo(0, gy);
            mCtx.lineTo(w, gy);
            mCtx.stroke();
          }

          const toMapX = (wx: number) => ((wx + 12) / 24) * w;
          const toMapY = (wz: number) => ((wz + 12) / 24) * h;

          mCtx.strokeStyle = '#64748b';
          mCtx.lineWidth = 3;
          mCtx.strokeRect(6, 6, w - 12, h - 12);

          mCtx.strokeStyle = '#475569';
          mCtx.lineWidth = 2;
          mCtx.beginPath();
          mCtx.moveTo(toMapX(-4), toMapY(-8));
          mCtx.lineTo(toMapX(-4), toMapY(0));
          mCtx.stroke();
          mCtx.beginPath();
          mCtx.moveTo(toMapX(4), toMapY(2));
          mCtx.lineTo(toMapX(4), toMapY(8));
          mCtx.stroke();

          // Staircase markers
          mCtx.fillStyle = 'rgba(234, 179, 8, 0.2)';
          mCtx.fillRect(toMapX(6.5), toMapY(-10), toMapX(10) - toMapX(6.5), toMapY(-2) - toMapY(-10));
          mCtx.fillStyle = '#facc15';
          mCtx.font = 'bold 8px sans-serif';
          mCtx.fillText('CẦU THANG 2', toMapX(8.2), toMapY(-6));

          mCtx.fillStyle = 'rgba(56, 189, 248, 0.2)';
          mCtx.fillRect(toMapX(-10), toMapY(-2), toMapX(-6.5) - toMapX(-10), toMapY(6) - toMapY(-2));
          mCtx.fillStyle = '#38bdf8';
          mCtx.fillText('CẦU THANG HẦM', toMapX(-8.2), toMapY(2));

          // Exit Door
          mCtx.fillStyle = '#10b981';
          mCtx.fillRect(toMapX(-1.5), toMapY(11.2), toMapX(3) - toMapX(0), 6);
          mCtx.fillStyle = '#6ee7b7';
          mCtx.font = 'bold 9px sans-serif';
          mCtx.textAlign = 'center';
          mCtx.fillText('CỔNG THOÁT', toMapX(0), toMapY(11.2) - 4);

          // Wardrobes
          wardrobes.forEach((wardrobe) => {
            const wx = toMapX(wardrobe.pos.x);
            const wy = toMapY(wardrobe.pos.z);
            mCtx.fillStyle = '#a855f7';
            mCtx.fillRect(wx - 4, wy - 4, 8, 8);
          });

          // Talisman Papers
          talismanItems.forEach((t) => {
            if (!t.collected) {
              const tx = toMapX(t.pos.x);
              const ty = toMapY(t.pos.z);
              mCtx.fillStyle = t.isTarget ? '#f59e0b' : '#94a3b8';
              mCtx.beginPath();
              mCtx.arc(tx, ty, t.isTarget ? 4.5 : 3, 0, Math.PI * 2);
              mCtx.fill();
            }
          });

          // Granny Marker
          const gx = toMapX(grannyGroup.position.x);
          const gy = toMapY(grannyGroup.position.z);
          const isSameFlr = (playerFloorLevelRef.current === grannyFloorLevelRef.current);

          if (isSameFlr) {
            const pulse = (Math.sin(Date.now() * 0.008) + 1) * 3;
            mCtx.fillStyle = 'rgba(239, 68, 68, 0.5)';
            mCtx.beginPath();
            mCtx.arc(gx, gy, 8 + pulse, 0, Math.PI * 2);
            mCtx.fill();
          }

          mCtx.fillStyle = isSameFlr ? '#ef4444' : '#6b7280';
          mCtx.beginPath();
          mCtx.arc(gx, gy, 4.5, 0, Math.PI * 2);
          mCtx.fill();
          mCtx.fillStyle = '#ffffff';
          mCtx.font = 'bold 8px sans-serif';
          mCtx.fillText('💀', gx, gy + 3);

          // Player Marker
          const px = toMapX(camera.position.x);
          const py = toMapY(camera.position.z);

          mCtx.fillStyle = 'rgba(6, 182, 212, 0.28)';
          mCtx.beginPath();
          mCtx.moveTo(px, py);
          const angle = yaw + Math.PI / 2;
          mCtx.arc(px, py, 22, angle - 0.45, angle + 0.45);
          mCtx.closePath();
          mCtx.fill();

          mCtx.fillStyle = '#06b6d4';
          mCtx.beginPath();
          mCtx.arc(px, py, 4.5, 0, Math.PI * 2);
          mCtx.fill();
          mCtx.strokeStyle = '#ffffff';
          mCtx.lineWidth = 1.5;
          mCtx.stroke();
        }
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      container.removeEventListener('click', onCanvasClick);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentWordIndex]);

  return (
    <div className="relative w-full h-[88vh] rounded-3xl overflow-hidden border border-red-950/80 bg-black select-none shadow-2xl">
      {/* 3D Canvas Mount Point */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-crosshair"
      />

      {/* Center Screen Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15 flex items-center justify-center">
        <div className={`transition-all duration-200 ${
          nearbyPaper || nearbyDoor || nearbyWardrobe 
            ? 'w-7 h-7 border-2 border-amber-400 bg-amber-400/20 rounded-full scale-110 shadow-lg shadow-amber-400/50' 
            : 'w-3 h-3 border border-white/60 bg-white/20 rounded-full'
        }`} />
      </div>

      {/* Pointer Lock Status Hint */}
      {!isPointerLocked && gameState === 'playing' && !isJumpscare && (
        <div 
          onClick={() => containerRef.current?.requestPointerLock?.()}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-25 bg-[#0b0f19]/90 border border-cyan-500/50 px-5 py-2 rounded-2xl text-xs text-cyan-300 font-bold flex items-center gap-2 cursor-pointer hover:bg-[#161F30] backdrop-blur-md shadow-xl transition"
        >
          <MousePointer className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Click chuột vào màn hình để khóa góc nhìn 3D (FPS Mode)</span>
        </div>
      )}

      {/* Spooky Horror Vignette Screen Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle, transparent 35%, rgba(136, 19, 19, ${heartbeatLevel * 0.008}) 75%, rgba(0, 0, 0, ${0.4 + heartbeatLevel * 0.005}) 100%)`
        }}
      />

      {/* VIOLENT JUMPSCARE OVERLAY */}
      {isJumpscare && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-red-600/40 animate-pulse flex flex-col items-center justify-center">
          <div className="text-8xl animate-bounce drop-shadow-[0_10px_20px_rgba(255,0,0,1)]">
            💀
          </div>
          <div className="text-4xl font-black text-red-500 uppercase tracking-widest mt-4 font-mono animate-ping">
            GRANNY ĐÃ BẮT ĐƯỢC BẠN!
          </div>
        </div>
      )}

      {/* TOP HEADER: OBJECTIVE & BLUEPRINT */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#0B0F19]/90 border border-red-500/40 rounded-3xl px-6 py-2.5 backdrop-blur-md shadow-2xl flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              MẬT MÃ CỔ BÙA MỞ KHÓA CỔNG GRANNY:
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-0.5">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-red-400 font-game">
              {activeVocab.target_text}
            </h2>
            <span className="text-xs text-cyan-300 font-medium">{activeVocab.phonetic}</span>
            <span className="text-xs text-gray-300 italic">({activeVocab.meaning})</span>
          </div>
        </div>

        {/* Lock Progress Indicator */}
        <div className="flex items-center gap-2 pl-4 border-l border-gray-700">
          {targetChars.map((ch, idx) => {
            const isPlaced = placedLocks.includes(ch);
            const isHeld = collectedPapers.some((p) => p.char === ch && p.isTarget);
            return (
              <div
                key={idx}
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg border transition-all ${
                  isPlaced
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 scale-105 shadow-md shadow-emerald-500/30'
                    : isHeld
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-[#161F30]/80 border-dashed border-gray-700 text-gray-600'
                }`}
              >
                {isPlaced ? <Unlock className="w-5 h-5 text-emerald-400" /> : isHeld ? ch : '?'}
              </div>
            );
          })}
        </div>
      </div>

      {/* TOP LEFT: CONTROLS & EXIT */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#0b0f19]/85 hover:bg-[#161F30] border border-gray-700 text-xs font-bold text-gray-200 backdrop-blur-md transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát Game
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-2xl bg-[#0b0f19]/85 hover:bg-[#161F30] border border-gray-700 text-gray-300 backdrop-blur-md transition cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
        </button>

        {/* Current Floor Name Badge */}
        <div className="bg-[#0b0f19]/85 border border-amber-500/40 px-3 py-1.5 rounded-2xl text-[11px] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1.5">
          <Footprints className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentFloorName}</span>
        </div>

        {/* Granny Floor Warning Pill */}
        {grannyOnSameFloor && (
          <div className="bg-red-950/90 border border-red-500/60 px-3 py-1.5 rounded-2xl text-[11px] font-black text-red-300 backdrop-blur-md flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>GRANNY ĐANG Ở CÙNG TẦNG VỚI BẠN!</span>
          </div>
        )}
      </div>

      {/* TOP RIGHT: REAL-TIME RADAR MINIMAP HUD */}
      <div className="absolute top-4 right-4 z-25 flex flex-col items-end gap-2">
        {/* Minimap Card */}
        <div className="bg-[#0B0F19]/95 border-2 border-cyan-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-3 pb-1.5 px-1 border-b border-gray-800">
            <span className="text-[10px] font-black text-cyan-400 tracking-wider flex items-center gap-1 uppercase">
              <Compass className="w-3 h-3 text-cyan-400" /> BẢN ĐỒ DINH THỰ
            </span>
            <button
              onClick={() => setIsMinimapExpanded(!isMinimapExpanded)}
              className="text-gray-400 hover:text-white transition p-0.5 rounded cursor-pointer"
            >
              {isMinimapExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* 2D Canvas Radar */}
          <canvas
            ref={minimapCanvasRef}
            width={isMinimapExpanded ? 240 : 160}
            height={isMinimapExpanded ? 240 : 160}
            className="rounded-xl mt-1.5 border border-gray-800/80 shadow-inner"
          />

          {/* Legend */}
          <div className="flex items-center gap-3 pt-2 text-[9px] text-gray-400 font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Bạn</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Granny</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Bùa</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500" /> Tủ</span>
          </div>
        </div>

        {/* Fear gauge & Battery */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0b0f19]/85 border border-gray-700 rounded-2xl px-3 py-1.5 text-xs text-amber-300 backdrop-blur-md">
            <Flashlight className={`w-4 h-4 ${flashlightOn ? 'text-amber-400' : 'text-gray-600'}`} />
            <span>F: {flashlightOn ? `SIÊU SÁNG (${battery}%)` : 'TẮT'}</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0b0f19]/85 border border-red-500/40 rounded-2xl px-3 py-1.5 backdrop-blur-md">
            <ShieldAlert className={`w-4 h-4 ${heartbeatLevel > 50 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
            <div className="w-14 h-2 rounded-full bg-gray-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-500 to-red-600 transition-all duration-200" 
                style={{ width: `${heartbeatLevel}%` }}
              />
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl px-3 py-1.5 text-cyan-300 font-mono text-xs font-bold backdrop-blur-md">
            Điểm: {score}
          </div>
        </div>
      </div>

      {/* Granny Noise Warning Banner */}
      {grannyAlertMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold px-6 py-2 rounded-full shadow-2xl animate-bounce flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span>{grannyAlertMsg}</span>
        </div>
      )}

      {/* Hiding in Wardrobe Screen Tint */}
      {isHiding && (
        <div className="absolute inset-0 z-15 bg-black/75 border-[28px] border-[#29170e]/95 flex items-center justify-center">
          <button 
            onClick={handleWardrobeAction}
            className="bg-[#1c120c]/95 border-2 border-amber-500 text-amber-300 text-xs font-bold px-6 py-3 rounded-2xl cursor-pointer hover:bg-amber-950/60 shadow-2xl transition animate-pulse flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-amber-400" />
            <span>ĐANG TRỐN TRONG TỦ QUẦN ÁO (Nhấn [R] hoặc Click để bước ra ngoài)</span>
          </button>
        </div>
      )}

      {/* INTERACTIVE ACTION PROMPTS */}
      {gameState === 'playing' && !isJumpscare && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          {nearbyPaper && (
            <button
              onClick={handleCollectAction}
              className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black px-7 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce cursor-pointer border-2 border-yellow-300/80 transition transform hover:scale-105"
            >
              <FileText className="w-5 h-5 text-yellow-300" />
              <span>
                Nhấn <strong>[E]</strong> hoặc Bấm vào đây để nhặt Mảnh Giấy Cổ Tự: <span className="text-yellow-200 text-2xl font-black">{nearbyPaper.char}</span> ({nearbyPaper.roomName})
              </span>
            </button>
          )}

          {nearbyDoor && (
            <button
              onClick={handleDoorAction}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black px-7 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce cursor-pointer border-2 border-cyan-300 transition transform hover:scale-105"
            >
              <Lock className="w-5 h-5 text-yellow-300" />
              <span>Nhấn <strong>[E]</strong> hoặc Bấm vào đây để dán Mảnh Giấy mở khóa Cổng Thoát Hiểm</span>
            </button>
          )}

          {nearbyWardrobe && !isHiding && (
            <button
              onClick={handleWardrobeAction}
              className="bg-purple-900 hover:bg-purple-800 border-2 border-purple-400 text-white font-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2.5 cursor-pointer transition transform hover:scale-105"
            >
              <Eye className="w-5 h-5 text-purple-300" />
              <span>Nhấn <strong>[R]</strong> hoặc Bấm vào đây để chui vào Tủ Quần Áo trốn Granny</span>
            </button>
          )}
        </div>
      )}

      {/* BOTTOM INVENTORY BAR */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#0B0F19]/90 border border-gray-800 rounded-2xl px-4 py-2 backdrop-blur-md flex items-center gap-3">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-amber-400" /> Túi Giấy Cổ Tự:
        </span>
        {collectedPapers.length === 0 ? (
          <span className="text-xs text-gray-500 italic">Chưa nhặt mảnh giấy nào trong nhà Granny...</span>
        ) : (
          collectedPapers.map((paper) => (
            <div
              key={paper.id}
              onClick={() => setInspectedPaper(paper)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition hover:scale-105 ${
                paper.isTarget
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-gray-800 border-gray-600 text-gray-400'
              }`}
            >
              <span className="text-base font-black">{paper.char}</span>
              <span className="text-[10px] text-gray-400">({paper.pinyin || 'giả'})</span>
            </div>
          ))
        )}
      </div>

      {/* PAPER INSPECTION MODAL */}
      {inspectedPaper && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1c1917] border-2 border-amber-500/60 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-400">
              <FileText className="w-6 h-6" />
            </div>

            <div className="p-6 bg-[#eed9a2] text-slate-900 rounded-2xl border-4 border-amber-800/80 shadow-inner">
              <span className="text-xs font-serif font-bold text-red-800 uppercase block tracking-widest mb-2">
                ★ BÙA CHÚ CỔ TỰ GRANNY ★
              </span>
              <h2 className="text-7xl font-black font-serif my-2 text-slate-950">
                {inspectedPaper.char}
              </h2>
              <p className="text-lg font-bold text-red-900 mt-2 font-mono">
                {inspectedPaper.pinyin}
              </p>
              <p className="text-xs text-slate-700 italic mt-1">
                {inspectedPaper.meaning}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => speakHanzi(inspectedPaper.char)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Volume1 className="w-4 h-4" /> Nghe Phát Âm
              </button>
              <button
                onClick={() => setInspectedPaper(null)}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOVEMENT GUIDES */}
      <div className="absolute bottom-4 left-4 z-20 bg-[#0b0f19]/80 border border-gray-800 rounded-xl px-3 py-2 text-[11px] text-gray-400 backdrop-blur-md pointer-events-none">
        <div><strong>W, A, S, D</strong>: Đi chậm • <strong>Shift</strong>: Chạy (gây tiếng động!)</div>
        <div><strong>Chuột</strong>: Nhìn • <strong>F</strong>: Đèn pin • <strong>E</strong>: Nhặt/Mở khóa • <strong>R</strong>: Trốn vào tủ</div>
      </div>

      {/* SUCCESS OVERLAY */}
      {gameState === 'escaped' && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center animate-in fade-in">
          <div className="bg-[#0f172a] border-2 border-emerald-500 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">BẠN ĐÃ MỞ KHÓA CỔNG VÀ TRỐN THOÁT!</h3>
            <p className="text-sm text-gray-300">
              Bạn đã dán đủ các mảnh giấy cổ tự <strong className="text-cyan-400 text-base">{activeVocab.target_text}</strong> ({activeVocab.meaning}) lên cánh cổng và phá giải toàn bộ xiềng xích của ngôi nhà ma Granny!
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCollectedPapers([]);
                  setPlacedLocks([]);
                  setCurrentWordIndex((idx) => (idx + 1) % (activeItems.length || 1));
                  setGameState('playing');
                }}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Tiếp tục từ vựng tiếp theo
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-3 rounded-2xl bg-[#1e293b] hover:bg-[#334155] text-gray-300 font-bold text-sm transition cursor-pointer"
              >
                Về Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAUGHT OVERLAY */}
      {gameState === 'caught' && (
        <div className="absolute inset-0 z-40 bg-red-950/95 backdrop-blur-md flex items-center justify-center animate-in fade-in">
          <div className="bg-[#180808] border-2 border-red-600 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500 flex items-center justify-center mx-auto text-red-500 animate-bounce">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-red-400">BẠN ĐÃ BỊ GRANNY BẮT GẶP!</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Granny đã phục kích bạn trên cùng một tầng! Hãy chú ý tiếng bước chân, quan sát vệt hào quang đỏ và chui vào tủ quần áo kịp thời nhé!
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCollectedPapers([]);
                  setPlacedLocks([]);
                  setGameState('playing');
                  setHeartbeatLevel(0);
                  playerPosRef.current.set(0, 5.8, 6);
                  playerFloorLevelRef.current = 2;
                }}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Thử Lại Vòng Này
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-3 rounded-2xl bg-[#1e293b] hover:bg-[#334155] text-gray-300 font-bold text-sm transition cursor-pointer"
              >
                Về Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

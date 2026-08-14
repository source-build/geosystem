import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** 检测浏览器是否支持 WebGL */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}

class NeuralNode {
  position: THREE.Vector3;
  connections: { node: NeuralNode; strength: number }[];
  level: number;
  type: number;
  size: number;
  distanceFromRoot: number;
  helixIndex?: number;
  helixT?: number;

  constructor(position: THREE.Vector3, level = 0, type = 0) {
    this.position = position;
    this.connections = [];
    this.level = level;
    this.type = type;
    this.size = type === 0
      ? THREE.MathUtils.randFloat(0.8, 1.4)
      : THREE.MathUtils.randFloat(0.5, 1.0);
    this.distanceFromRoot = 0;
  }

  addConnection(node: NeuralNode, strength = 1.0) {
    if (!this.isConnectedTo(node)) {
      this.connections.push({ node, strength });
      node.connections.push({ node: this, strength });
    }
  }

  isConnectedTo(node: NeuralNode): boolean {
    return this.connections.some(conn => conn.node === node);
  }
}

export function initNeuralBackground(canvas: HTMLCanvasElement): () => void {
  const config = {
    paused: false,
    activePaletteIndex: 0,
    currentFormation: 0,
    densityFactor: 1
  };

  const colorPalettes = [
    [
      new THREE.Color(0x667eea),
      new THREE.Color(0x764ba2),
      new THREE.Color(0xf093fb),
      new THREE.Color(0x9d50bb),
      new THREE.Color(0x6e48aa)
    ]
  ];

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.002);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 8, 38);
  camera.lookAt(0, 0, 0);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Starfield
  function createStarfield(): THREE.Points {
    const count = 8000;
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
      const r = THREE.MathUtils.randFloat(50, 150);
      const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
      const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        colors.push(1, 1, 1);
      } else if (colorChoice < 0.85) {
        colors.push(0.7, 0.8, 1);
      } else {
        colors.push(1, 0.9, 0.8);
      }
      sizes.push(THREE.MathUtils.randFloat(0.1, 0.3));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float uTime;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 2.0 + position.x * 100.0) * 0.3 + 0.7;
          gl_PointSize = size * twinkle * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    return new THREE.Points(geo, mat);
  }

  const starField = createStarfield();
  scene.add(starField);

  // 飘浮光粒子 — 从左往右缓慢飘动的光点
  function createFloatingLights(): THREE.Points {
    const count = 25;
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const palette = colorPalettes[0];

    for (let i = 0; i < count; i++) {
      positions.push(
        THREE.MathUtils.randFloat(-50, 10),
        THREE.MathUtils.randFloat(-20, 20),
        THREE.MathUtils.randFloat(-25, 25)
      );
      const c = palette[Math.floor(Math.random() * palette.length)].clone();
      c.offsetHSL(0, -0.1, 0.25);
      colors.push(c.r, c.g, c.b);
      sizes.push(THREE.MathUtils.randFloat(0.4, 1.0));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vPulse;
        uniform float uTime;
        void main() {
          vColor = color;
          vec3 pos = position;
          // 从左往右缓慢飘动，循环
          float range = 70.0;
          pos.x = mod(pos.x + uTime * 1.2 + 50.0, range) - 35.0;
          // 轻微上下浮动
          pos.y += sin(uTime * 0.25 + position.z * 0.2) * 1.5;
          pos.z += sin(uTime * 0.2 + position.x * 0.15) * 1.0;
          // 呼吸脉冲
          float pulse = 0.6 + 0.4 * sin(uTime * 0.7 + position.x * 0.3 + position.z * 0.25);
          vPulse = pulse;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pulse * (400.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vPulse;
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          if (dist > 0.5) discard;
          float glow = pow(1.0 - smoothstep(0.0, 0.5, dist), 1.8);
          gl_FragColor = vec4(vColor * 1.3, glow * vPulse * 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geo, mat);
  }

  const floatingLights = createFloatingLights();
  scene.add(floatingLights);

  // 神经网络容器 - 偏移到左侧展示
  const networkGroup = new THREE.Group();
  networkGroup.position.x = -15;
  scene.add(networkGroup);

  // Controls — 仅保留缩放，禁用旋转和自动旋转
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableRotate = false;
  controls.enablePan = false;
  controls.enableZoom = true;
  controls.minDistance = 15;
  controls.maxDistance = 80;
  controls.autoRotate = false;

  // Post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.8,
    0.6,
    0.7
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  // Pulse uniforms
  const pulseUniforms = {
    uTime: { value: 0.0 },
    uPulsePositions: {
      value: [
        new THREE.Vector3(1e3, 1e3, 1e3),
        new THREE.Vector3(1e3, 1e3, 1e3),
        new THREE.Vector3(1e3, 1e3, 1e3)
      ]
    },
    uPulseTimes: { value: [-1e3, -1e3, -1e3] },
    uPulseColors: {
      value: [
        new THREE.Color(1, 1, 1),
        new THREE.Color(1, 1, 1),
        new THREE.Color(1, 1, 1)
      ]
    },
    uPulseSpeed: { value: 18.0 },
    uBaseNodeSize: { value: 0.6 }
  };

  // Noise functions (GLSL)
  const noiseFunctions = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }`;

  // Node shader
  const nodeShader = {
    vertexShader: `${noiseFunctions}
    attribute float nodeSize;
    attribute float nodeType;
    attribute vec3 nodeColor;
    attribute float distanceFromRoot;

    uniform float uTime;
    uniform vec3 uPulsePositions[3];
    uniform float uPulseTimes[3];
    uniform float uPulseSpeed;
    uniform float uBaseNodeSize;

    varying vec3 vColor;
    varying float vNodeType;
    varying vec3 vPosition;
    varying float vPulseIntensity;
    varying float vDistanceFromRoot;
    varying float vGlow;
    float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
        if (pulseTime < 0.0) return 0.0;
        float timeSinceClick = uTime - pulseTime;
        if (timeSinceClick < 0.0 || timeSinceClick > 4.0) return 0.0;
        float pulseRadius = timeSinceClick * uPulseSpeed;
        float distToClick = distance(worldPos, pulsePos);
        float pulseThickness = 3.0;
        float waveProximity = abs(distToClick - pulseRadius);
        return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(4.0, 0.0, timeSinceClick);
    }
    void main() {
        vNodeType = nodeType;
        vColor = nodeColor;
        vDistanceFromRoot = distanceFromRoot;
        vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vPosition = worldPos;
        float totalPulseIntensity = 0.0;
        for (int i = 0; i < 3; i++) {
            totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
        }
        vPulseIntensity = min(totalPulseIntensity, 1.0);
        float breathe = sin(uTime * 0.7 + distanceFromRoot * 0.15) * 0.15 + 0.85;
        float baseSize = nodeSize * breathe;
        float pulseSize = baseSize * (1.0 + vPulseIntensity * 2.5);
        vGlow = 0.5 + 0.5 * sin(uTime * 0.5 + distanceFromRoot * 0.2);
        vec3 modifiedPosition = position;
        if (nodeType > 0.5) {
            float noise = snoise(position * 0.08 + uTime * 0.08);
            modifiedPosition += normal * noise * 0.15;
        }
        vec4 mvPosition = modelViewMatrix * vec4(modifiedPosition, 1.0);
        gl_PointSize = pulseSize * uBaseNodeSize * (1000.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }`,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uPulseColors[3];

    varying vec3 vColor;
    varying float vNodeType;
    varying vec3 vPosition;
    varying float vPulseIntensity;
    varying float vDistanceFromRoot;
    varying float vGlow;
    void main() {
        vec2 center = 2.0 * gl_PointCoord - 1.0;
        float dist = length(center);
        if (dist > 1.0) discard;
        float glow1 = 1.0 - smoothstep(0.0, 0.5, dist);
        float glow2 = 1.0 - smoothstep(0.0, 1.0, dist);
        float glowStrength = pow(glow1, 1.2) + glow2 * 0.3;
        float breatheColor = 0.9 + 0.1 * sin(uTime * 0.6 + vDistanceFromRoot * 0.25);
        vec3 baseColor = vColor * breatheColor;
        vec3 finalColor = baseColor;
        if (vPulseIntensity > 0.0) {
            vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.4);
            finalColor = mix(baseColor, pulseColor, vPulseIntensity * 0.8);
            finalColor *= (1.0 + vPulseIntensity * 1.2);
            glowStrength *= (1.0 + vPulseIntensity);
        }
        float coreBrightness = smoothstep(0.4, 0.0, dist);
        finalColor += vec3(1.0) * coreBrightness * 0.3;
        float alpha = glowStrength * (0.95 - 0.3 * dist);
        float camDistance = length(vPosition - cameraPosition);
        float distanceFade = smoothstep(100.0, 15.0, camDistance);
        if (vNodeType > 0.5) {
            finalColor *= 1.1;
            alpha *= 0.9;
        }
        finalColor *= (1.0 + vGlow * 0.1);
        gl_FragColor = vec4(finalColor, alpha * distanceFade);
    }`
  };

  // Connection shader
  const connectionShader = {
    vertexShader: `${noiseFunctions}
    attribute vec3 startPoint;
    attribute vec3 endPoint;
    attribute float connectionStrength;
    attribute float pathIndex;
    attribute vec3 connectionColor;

    uniform float uTime;
    uniform vec3 uPulsePositions[3];
    uniform float uPulseTimes[3];
    uniform float uPulseSpeed;

    varying vec3 vColor;
    varying float vConnectionStrength;
    varying float vPulseIntensity;
    varying float vPathPosition;
    varying float vDistanceFromCamera;
    float getPulseIntensity(vec3 worldPos, vec3 pulsePos, float pulseTime) {
        if (pulseTime < 0.0) return 0.0;
        float timeSinceClick = uTime - pulseTime;
        if (timeSinceClick < 0.0 || timeSinceClick > 4.0) return 0.0;

        float pulseRadius = timeSinceClick * uPulseSpeed;
        float distToClick = distance(worldPos, pulsePos);
        float pulseThickness = 3.0;
        float waveProximity = abs(distToClick - pulseRadius);

        return smoothstep(pulseThickness, 0.0, waveProximity) * smoothstep(4.0, 0.0, timeSinceClick);
    }
    void main() {
        float t = position.x;
        vPathPosition = t;
        vec3 midPoint = mix(startPoint, endPoint, 0.5);
        float pathOffset = sin(t * 3.14159) * 0.15;
        vec3 perpendicular = normalize(cross(normalize(endPoint - startPoint), vec3(0.0, 1.0, 0.0)));
        if (length(perpendicular) < 0.1) perpendicular = vec3(1.0, 0.0, 0.0);
        midPoint += perpendicular * pathOffset;
        vec3 p0 = mix(startPoint, midPoint, t);
        vec3 p1 = mix(midPoint, endPoint, t);
        vec3 finalPos = mix(p0, p1, t);
        float noiseTime = uTime * 0.15;
        float noise = snoise(vec3(pathIndex * 0.08, t * 0.6, noiseTime));
        finalPos += perpendicular * noise * 0.12;
        vec3 worldPos = (modelMatrix * vec4(finalPos, 1.0)).xyz;
        float totalPulseIntensity = 0.0;
        for (int i = 0; i < 3; i++) {
            totalPulseIntensity += getPulseIntensity(worldPos, uPulsePositions[i], uPulseTimes[i]);
        }
        vPulseIntensity = min(totalPulseIntensity, 1.0);
        vColor = connectionColor;
        vConnectionStrength = connectionStrength;

        vDistanceFromCamera = length(worldPos - cameraPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
    }`,
    fragmentShader: `
    uniform float uTime;
    uniform vec3 uPulseColors[3];

    varying vec3 vColor;
    varying float vConnectionStrength;
    varying float vPulseIntensity;
    varying float vPathPosition;
    varying float vDistanceFromCamera;
    void main() {
        float flowPattern1 = sin(vPathPosition * 25.0 - uTime * 4.0) * 0.5 + 0.5;
        float flowPattern2 = sin(vPathPosition * 15.0 - uTime * 2.5 + 1.57) * 0.5 + 0.5;
        float combinedFlow = (flowPattern1 + flowPattern2 * 0.5) / 1.5;

        vec3 baseColor = vColor * (0.8 + 0.2 * sin(uTime * 0.6 + vPathPosition * 12.0));
        float flowIntensity = 0.4 * combinedFlow * vConnectionStrength;
        vec3 finalColor = baseColor;
        if (vPulseIntensity > 0.0) {
            vec3 pulseColor = mix(vec3(1.0), uPulseColors[0], 0.3);
            finalColor = mix(baseColor, pulseColor * 1.2, vPulseIntensity * 0.7);
            flowIntensity += vPulseIntensity * 0.8;
        }
        finalColor *= (0.7 + flowIntensity + vConnectionStrength * 0.5);
        float baseAlpha = 0.7 * vConnectionStrength;
        float flowAlpha = combinedFlow * 0.3;
        float alpha = baseAlpha + flowAlpha;
        alpha = mix(alpha, min(1.0, alpha * 2.5), vPulseIntensity);
        float distanceFade = smoothstep(100.0, 15.0, vDistanceFromCamera);
        gl_FragColor = vec4(finalColor, alpha * distanceFade);
    }`
  };

  // Clock (must be before triggerPulse)
  const clock = new THREE.Clock();

  // 入场缩放动画：初始化时把相机推远一点（星球显得更小），页面加载成功 1 秒后，
  // 沿当前视角方向平滑拉近到原本的展示大小，模拟「手势缩放（pinch zoom）」放大效果。
  // 仅改变相机距离、不改变视角角度，落点即原本的位置。
  const zoomStartDelay = 1.0; // 延迟触发时间（秒）
  const zoomDuration = 1.0; // 缩放动画时长（秒）
  const zoomInitScale = 2.0; // 初始距离 = 目标距离 × 此值（>1 表示初始更远 / 星球更小）
  const finalDir = camera.position.clone().sub(controls.target).normalize();
  const finalDist = camera.position.distanceTo(controls.target); // 原本展示大小对应的距离
  const initDist = finalDist * zoomInitScale; // 初始（更远）距离
  // 临时放宽最大缩放距离以容纳更远的初始位置（动画期间手势已禁用，不会越界），结束后恢复
  const originalMaxDistance = controls.maxDistance;
  controls.maxDistance = initDist + 5;
  // 初始化即把相机置于更远的起始位置，页面打开瞬间星球更小
  camera.position
    .copy(controls.target)
    .add(finalDir.clone().multiplyScalar(initDist));
  // 动画完成前禁用手势交互，避免拉近过程中被滚轮 / 触摸缩放干扰
  controls.enabled = false;
  let zoomTriggered = false;
  let zoomFinished = false;
  let zoomStartTime = 0;
  const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

  // Network generation
  function generateNeuralNetwork(
    formationIndex: number,
    densityFactor = 1.0
  ): { nodes: NeuralNode[]; rootNode: NeuralNode } {
    let nodes: NeuralNode[] = [];
    let rootNode: NeuralNode;

    function generateCrystallineSphere() {
      rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0);
      rootNode.size = 2.0;
      nodes.push(rootNode);
      const layers = 5;
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      for (let layer = 1; layer <= layers; layer++) {
        const radius = layer * 4;
        const numPoints = Math.floor(layer * 12 * densityFactor);
        for (let i = 0; i < numPoints; i++) {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
          const theta = (2 * Math.PI * i) / goldenRatio;
          const pos = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
          const isLeaf = layer === layers || Math.random() < 0.3;
          const node = new NeuralNode(pos, layer, isLeaf ? 1 : 0);
          node.distanceFromRoot = radius;
          nodes.push(node);
          if (layer > 1) {
            const prevLayerNodes = nodes.filter(
              n => n.level === layer - 1 && n !== rootNode
            );
            prevLayerNodes.sort(
              (a, b) =>
                pos.distanceTo(a.position) - pos.distanceTo(b.position)
            );
            for (let j = 0; j < Math.min(3, prevLayerNodes.length); j++) {
              const dist = pos.distanceTo(prevLayerNodes[j].position);
              const strength = 1.0 - dist / (radius * 2);
              node.addConnection(prevLayerNodes[j], Math.max(0.3, strength));
            }
          } else {
            rootNode.addConnection(node, 0.9);
          }
        }
        const layerNodes = nodes.filter(
          n => n.level === layer && n !== rootNode
        );
        for (let i = 0; i < layerNodes.length; i++) {
          const node = layerNodes[i];
          const nearby = layerNodes
            .filter(n => n !== node)
            .sort(
              (a, b) =>
                node.position.distanceTo(a.position) -
                node.position.distanceTo(b.position)
            )
            .slice(0, 5);
          for (const nearNode of nearby) {
            const dist = node.position.distanceTo(nearNode.position);
            if (dist < radius * 0.8 && !node.isConnectedTo(nearNode)) {
              node.addConnection(nearNode, 0.6);
            }
          }
        }
      }
      const outerNodes = nodes.filter(n => n.level >= 3);
      for (let i = 0; i < Math.min(20, outerNodes.length); i++) {
        const n1 = outerNodes[Math.floor(Math.random() * outerNodes.length)];
        const n2 = outerNodes[Math.floor(Math.random() * outerNodes.length)];
        if (n1 !== n2 && !n1.isConnectedTo(n2) && Math.abs(n1.level - n2.level) > 1) {
          n1.addConnection(n2, 0.4);
        }
      }
    }

    function generateHelixLattice() {
      rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0);
      rootNode.size = 1.8;
      nodes.push(rootNode);
      const numHelices = 4;
      const height = 30;
      const maxRadius = 12;
      const nodesPerHelix = Math.floor(50 * densityFactor);
      const helixArrays: NeuralNode[][] = [];
      for (let h = 0; h < numHelices; h++) {
        const helixPhase = (h / numHelices) * Math.PI * 2;
        const helixNodes: NeuralNode[] = [];
        for (let i = 0; i < nodesPerHelix; i++) {
          const t = i / (nodesPerHelix - 1);
          const y = (t - 0.5) * height;
          const radiusScale = Math.sin(t * Math.PI) * 0.7 + 0.3;
          const radius = maxRadius * radiusScale;
          const angle = helixPhase + t * Math.PI * 6;
          const pos = new THREE.Vector3(
            radius * Math.cos(angle),
            y,
            radius * Math.sin(angle)
          );
          const level = Math.ceil(t * 5);
          const isLeaf = i > nodesPerHelix - 5 || Math.random() < 0.25;
          const node = new NeuralNode(pos, level, isLeaf ? 1 : 0);
          node.distanceFromRoot = Math.sqrt(radius * radius + y * y);
          node.helixIndex = h;
          node.helixT = t;
          nodes.push(node);
          helixNodes.push(node);
        }
        helixArrays.push(helixNodes);
        rootNode.addConnection(helixNodes[0], 1.0);
        for (let i = 0; i < helixNodes.length - 1; i++) {
          helixNodes[i].addConnection(helixNodes[i + 1], 0.85);
        }
      }
      for (let h = 0; h < numHelices; h++) {
        const currentHelix = helixArrays[h];
        const nextHelix = helixArrays[(h + 1) % numHelices];
        for (let i = 0; i < currentHelix.length; i += 5) {
          const t = currentHelix[i].helixT!;
          const targetIdx = Math.round(t * (nextHelix.length - 1));
          if (targetIdx < nextHelix.length) {
            currentHelix[i].addConnection(nextHelix[targetIdx], 0.7);
          }
        }
      }
      for (const helix of helixArrays) {
        for (let i = 0; i < helix.length; i += 8) {
          const node = helix[i];
          const innerNodes = nodes.filter(
            n =>
              n !== node &&
              n !== rootNode &&
              n.distanceFromRoot < node.distanceFromRoot * 0.5
          );
          if (innerNodes.length > 0) {
            const nearest = innerNodes.sort(
              (a, b) =>
                node.position.distanceTo(a.position) -
                node.position.distanceTo(b.position)
            )[0];
            node.addConnection(nearest, 0.5);
          }
        }
      }
      const allHelixNodes = nodes.filter(n => n !== rootNode);
      for (let i = 0; i < Math.floor(30 * densityFactor); i++) {
        const n1 = allHelixNodes[Math.floor(Math.random() * allHelixNodes.length)];
        const nearby = allHelixNodes.filter(n => {
          const dist = n.position.distanceTo(n1.position);
          return n !== n1 && dist < 8 && dist > 3 && !n1.isConnectedTo(n);
        });
        if (nearby.length > 0) {
          const n2 = nearby[Math.floor(Math.random() * nearby.length)];
          n1.addConnection(n2, 0.45);
        }
      }
    }

    function generateFractalWeb() {
      rootNode = new NeuralNode(new THREE.Vector3(0, 0, 0), 0, 0);
      rootNode.size = 1.6;
      nodes.push(rootNode);
      const branches = 6;
      const maxDepth = 4;

      function createBranch(
        startNode: NeuralNode,
        direction: THREE.Vector3,
        depth: number,
        strength: number,
        scale: number
      ) {
        if (depth > maxDepth) return;
        const branchLength = 5 * scale;
        const endPos = new THREE.Vector3()
          .copy(startNode.position)
          .add(direction.clone().multiplyScalar(branchLength));
        const isLeaf = depth === maxDepth || Math.random() < 0.3;
        const newNode = new NeuralNode(endPos, depth, isLeaf ? 1 : 0);
        newNode.distanceFromRoot = rootNode.position.distanceTo(endPos);
        nodes.push(newNode);
        startNode.addConnection(newNode, strength);
        if (depth < maxDepth) {
          const subBranches = 3;
          for (let i = 0; i < subBranches; i++) {
            const angle = (i / subBranches) * Math.PI * 2;
            const perpDir1 = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
            const perpDir2 = direction.clone().cross(perpDir1).normalize();
            const newDir = new THREE.Vector3()
              .copy(direction)
              .add(perpDir1.clone().multiplyScalar(Math.cos(angle) * 0.7))
              .add(perpDir2.clone().multiplyScalar(Math.sin(angle) * 0.7))
              .normalize();
            createBranch(newNode, newDir, depth + 1, strength * 0.7, scale * 0.75);
          }
        }
      }

      for (let i = 0; i < branches; i++) {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / branches);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const direction = new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.sin(phi) * Math.sin(theta),
          Math.cos(phi)
        ).normalize();
        createBranch(rootNode, direction, 1, 0.9, 1.0);
      }

      const leafNodes = nodes.filter(n => n.level >= 2);
      for (let i = 0; i < leafNodes.length; i++) {
        const node = leafNodes[i];
        const nearby = leafNodes
          .filter(n => {
            const dist = n.position.distanceTo(node.position);
            return n !== node && dist < 10 && !node.isConnectedTo(n);
          })
          .sort(
            (a, b) =>
              node.position.distanceTo(a.position) -
              node.position.distanceTo(b.position)
          )
          .slice(0, 3);
        for (const nearNode of nearby) {
          if (Math.random() < 0.5 * densityFactor) {
            node.addConnection(nearNode, 0.5);
          }
        }
      }
      const midLevelNodes = nodes.filter(n => n.level >= 2 && n.level <= 3);
      for (const node of midLevelNodes) {
        if (Math.random() < 0.3) {
          const innerNodes = nodes.filter(
            n => n !== node && n.distanceFromRoot < node.distanceFromRoot * 0.6
          );
          if (innerNodes.length > 0) {
            const target = innerNodes[Math.floor(Math.random() * innerNodes.length)];
            if (!node.isConnectedTo(target)) {
              node.addConnection(target, 0.4);
            }
          }
        }
      }
    }

    switch (formationIndex % 3) {
      case 0: generateCrystallineSphere(); break;
      case 1: generateHelixLattice(); break;
      case 2: generateFractalWeb(); break;
    }

    if (densityFactor < 1.0) {
      const targetCount = Math.ceil(nodes.length * Math.max(0.3, densityFactor));
      const toKeep = new Set<NeuralNode>([rootNode]);
      const sortedNodes = nodes
        .filter(n => n !== rootNode)
        .sort((a, b) => {
          const scoreA = a.connections.length * (1 / (a.distanceFromRoot + 1));
          const scoreB = b.connections.length * (1 / (b.distanceFromRoot + 1));
          return scoreB - scoreA;
        });
      for (let i = 0; i < Math.min(targetCount - 1, sortedNodes.length); i++) {
        toKeep.add(sortedNodes[i]);
      }
      nodes = nodes.filter(n => toKeep.has(n));
      nodes.forEach(node => {
        node.connections = node.connections.filter(conn => toKeep.has(conn.node));
      });
    }

    return { nodes, rootNode };
  }

  // Visualization
  let nodesMesh: THREE.Points | null = null;
  let connectionsMesh: THREE.LineSegments | null = null;
  let neuralNetwork: { nodes: NeuralNode[]; rootNode: NeuralNode } | null = null;

  function createNetworkVisualization(formationIndex: number, densityFactor = 1.0) {
    if (nodesMesh) {
      networkGroup.remove(nodesMesh);
      nodesMesh.geometry.dispose();
      (nodesMesh.material as THREE.ShaderMaterial).dispose();
    }
    if (connectionsMesh) {
      networkGroup.remove(connectionsMesh);
      connectionsMesh.geometry.dispose();
      (connectionsMesh.material as THREE.ShaderMaterial).dispose();
    }

    neuralNetwork = generateNeuralNetwork(formationIndex, densityFactor);
    if (!neuralNetwork || neuralNetwork.nodes.length === 0) return;

    const palette = colorPalettes[config.activePaletteIndex];

    // Nodes
    const nodePositions: number[] = [];
    const nodeTypes: number[] = [];
    const nodeSizes: number[] = [];
    const nodeColors: number[] = [];
    const distancesFromRoot: number[] = [];

    neuralNetwork.nodes.forEach(node => {
      nodePositions.push(node.position.x, node.position.y, node.position.z);
      nodeTypes.push(node.type);
      nodeSizes.push(node.size);
      distancesFromRoot.push(node.distanceFromRoot);
      const colorIndex = Math.min(node.level, palette.length - 1);
      const baseColor = palette[colorIndex % palette.length].clone();
      baseColor.offsetHSL(
        THREE.MathUtils.randFloatSpread(0.03),
        THREE.MathUtils.randFloatSpread(0.08),
        THREE.MathUtils.randFloatSpread(0.08)
      );
      nodeColors.push(baseColor.r, baseColor.g, baseColor.b);
    });

    const nodesGeometry = new THREE.BufferGeometry();
    nodesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
    nodesGeometry.setAttribute('nodeType', new THREE.Float32BufferAttribute(nodeTypes, 1));
    nodesGeometry.setAttribute('nodeSize', new THREE.Float32BufferAttribute(nodeSizes, 1));
    nodesGeometry.setAttribute('nodeColor', new THREE.Float32BufferAttribute(nodeColors, 3));
    nodesGeometry.setAttribute('distanceFromRoot', new THREE.Float32BufferAttribute(distancesFromRoot, 1));

    const nodesMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(pulseUniforms),
      vertexShader: nodeShader.vertexShader,
      fragmentShader: nodeShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    nodesMesh = new THREE.Points(nodesGeometry, nodesMaterial);
    networkGroup.add(nodesMesh);

    // Connections
    const connectionColors: number[] = [];
    const connectionStrengths: number[] = [];
    const connectionPositions: number[] = [];
    const startPoints: number[] = [];
    const endPoints: number[] = [];
    const pathIndices: number[] = [];
    const processedConnections = new Set<string>();
    let pathIndex = 0;

    neuralNetwork.nodes.forEach((node, nodeIndex) => {
      node.connections.forEach(connection => {
        const connectedNode = connection.node;
        const connectedIndex = neuralNetwork!.nodes.indexOf(connectedNode);
        if (connectedIndex === -1) return;
        const key = [Math.min(nodeIndex, connectedIndex), Math.max(nodeIndex, connectedIndex)].join('-');
        if (!processedConnections.has(key)) {
          processedConnections.add(key);
          const startPoint = node.position;
          const endPoint = connectedNode.position;
          const numSegments = 20;
          for (let i = 0; i < numSegments; i++) {
            const t = i / (numSegments - 1);
            connectionPositions.push(t, 0, 0);
            startPoints.push(startPoint.x, startPoint.y, startPoint.z);
            endPoints.push(endPoint.x, endPoint.y, endPoint.z);
            pathIndices.push(pathIndex);
            connectionStrengths.push(connection.strength);
            const avgLevel = Math.min(
              Math.floor((node.level + connectedNode.level) / 2),
              palette.length - 1
            );
            const baseColor = palette[avgLevel % palette.length].clone();
            baseColor.offsetHSL(
              THREE.MathUtils.randFloatSpread(0.03),
              THREE.MathUtils.randFloatSpread(0.08),
              THREE.MathUtils.randFloatSpread(0.08)
            );
            connectionColors.push(baseColor.r, baseColor.g, baseColor.b);
          }
          pathIndex++;
        }
      });
    });

    const connectionsGeometry = new THREE.BufferGeometry();
    connectionsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3));
    connectionsGeometry.setAttribute('startPoint', new THREE.Float32BufferAttribute(startPoints, 3));
    connectionsGeometry.setAttribute('endPoint', new THREE.Float32BufferAttribute(endPoints, 3));
    connectionsGeometry.setAttribute('connectionStrength', new THREE.Float32BufferAttribute(connectionStrengths, 1));
    connectionsGeometry.setAttribute('connectionColor', new THREE.Float32BufferAttribute(connectionColors, 3));
    connectionsGeometry.setAttribute('pathIndex', new THREE.Float32BufferAttribute(pathIndices, 1));

    const connectionsMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(pulseUniforms),
      vertexShader: connectionShader.vertexShader,
      fragmentShader: connectionShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    connectionsMesh = new THREE.LineSegments(connectionsGeometry, connectionsMaterial);
    networkGroup.add(connectionsMesh);

    palette.forEach((color, i) => {
      if (i < 3) {
        connectionsMaterial.uniforms.uPulseColors.value[i].copy(color);
        nodesMaterial.uniforms.uPulseColors.value[i].copy(color);
      }
    });
  }

  // Pulse trigger
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const interactionPoint = new THREE.Vector3();
  let lastPulseIndex = 0;

  function triggerPulse(clientX: number, clientY: number) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    interactionPlane.normal.copy(camera.position).normalize();
    interactionPlane.constant =
      -interactionPlane.normal.dot(camera.position) + camera.position.length() * 0.5;
    if (raycaster.ray.intersectPlane(interactionPlane, interactionPoint)) {
      const time = clock.getElapsedTime();
      if (nodesMesh && connectionsMesh) {
        lastPulseIndex = (lastPulseIndex + 1) % 3;
        const nodeUniforms = (nodesMesh.material as THREE.ShaderMaterial).uniforms;
        const connUniforms = (connectionsMesh.material as THREE.ShaderMaterial).uniforms;
        (nodeUniforms.uPulsePositions.value as THREE.Vector3[])[lastPulseIndex].copy(interactionPoint);
        (nodeUniforms.uPulseTimes.value as number[])[lastPulseIndex] = time;
        (connUniforms.uPulsePositions.value as THREE.Vector3[])[lastPulseIndex].copy(interactionPoint);
        (connUniforms.uPulseTimes.value as number[])[lastPulseIndex] = time;
        const palette = colorPalettes[config.activePaletteIndex];
        const randomColor = palette[Math.floor(Math.random() * palette.length)];
        (nodeUniforms.uPulseColors.value as THREE.Color[])[lastPulseIndex].copy(randomColor);
        (connUniforms.uPulseColors.value as THREE.Color[])[lastPulseIndex].copy(randomColor);
      }
    }
  }

  // Event listeners
  const clickHandler = (e: MouseEvent) => {
    if (!config.paused) triggerPulse(e.clientX, e.clientY);
  };
  canvas.addEventListener('click', clickHandler);

  const touchHandler = (e: TouchEvent) => {
    if (e.touches.length > 0 && !config.paused) {
      triggerPulse(e.touches[0].clientX, e.touches[0].clientY);
    }
  };
  canvas.addEventListener('touchstart', touchHandler);

  // Animation
  let animationId: number;

  function animate() {
    animationId = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // 入场缩放：到达延迟时间后，从初始（远）位置拉近到原本展示大小
    if (!zoomTriggered && t >= zoomStartDelay) {
      zoomTriggered = true;
      zoomStartTime = t;
    }
    if (zoomTriggered && !zoomFinished) {
      const progress = Math.min((t - zoomStartTime) / zoomDuration, 1);
      const dist = initDist + (finalDist - initDist) * easeOutCubic(progress);
      camera.position
        .copy(controls.target)
        .add(finalDir.clone().multiplyScalar(dist));
      if (progress >= 1) {
        zoomFinished = true;
        controls.enabled = true; // 动画完成，恢复手势交互
        controls.maxDistance = originalMaxDistance; // 恢复原本的最大缩放范围
      }
    }
    if (!config.paused) {
      if (nodesMesh) {
        (nodesMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      }
      if (connectionsMesh) {
        (connectionsMesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
      }
      networkGroup.rotation.y = t * 0.03;
    }
    starField.rotation.y += 0.0002;
    (starField.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    (floatingLights.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
    controls.update();
    composer.render();
  }

  // Resize
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.resolution.set(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  // Init
  createNetworkVisualization(config.currentFormation, config.densityFactor);
  animate();

  // Cleanup
  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', onResize);
    canvas.removeEventListener('click', clickHandler);
    canvas.removeEventListener('touchstart', touchHandler);
    controls.dispose();
    renderer.dispose();
    if (nodesMesh) {
      nodesMesh.geometry.dispose();
      (nodesMesh.material as THREE.ShaderMaterial).dispose();
    }
    if (connectionsMesh) {
      connectionsMesh.geometry.dispose();
      (connectionsMesh.material as THREE.ShaderMaterial).dispose();
    }
    starField.geometry.dispose();
    (starField.material as THREE.ShaderMaterial).dispose();
    floatingLights.geometry.dispose();
    (floatingLights.material as THREE.ShaderMaterial).dispose();
  };
}

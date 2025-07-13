import GUI from 'lil-gui'
import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Clock,
  Color,
  ExtrudeGeometry,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Raycaster,
  Scene,
  Shape,
  SphereGeometry,
  Spherical,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as animations from './helpers/animations'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

import './style.css'

const CANVAS_ID = 'scene'

let canvas: HTMLElement
let renderer: WebGLRenderer
let scene: Scene
let loadingManager: LoadingManager
let ambientLight: AmbientLight
let pointLight: PointLight
let cube: Mesh
let camera: PerspectiveCamera
let cameraControls: OrbitControls
let dragControls: DragControls
let axesHelper: AxesHelper
let pointLightHelper: PointLightHelper
let clock: Clock
let stats: Stats
let gui: GUI

const animation = { enabled: true, play: true }
let cuboid: Mesh, raycaster: Raycaster, mouse: Vector2;
init()
animate()

function init() {
  // ===== 🖼️ CANVAS, RENDERER, & SCENE =====
  {
    canvas = document.querySelector(`canvas#${CANVAS_ID}`)!
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = PCFSoftShadowMap
    scene = new Scene()
    scene.background = new Color('#fdb979');

  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    loadingManager = new LoadingManager()

    loadingManager.onStart = () => {
      console.log('loading started')
    }
    loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:')
      console.log(`${url} -> ${loaded} / ${total}`)
    }
    loadingManager.onLoad = () => {
      console.log('loaded!')
    }
    loadingManager.onError = () => {
      console.log('❌ error while loading')
    }
  }

  // ===== 💡 LIGHTS =====
  {
    ambientLight = new AmbientLight('white', 2.25)
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(-2, 2, 2)
    pointLight.castShadow = false
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    scene.add(pointLight)
  }

  // === Loading custom fonts
  {
    const fontLoader = new FontLoader();
    const ttfLoader = new TTFLoader();
    ttfLoader.load('fonts/poppins.medium.ttf', (json) => {
      // First parse the font.
      const jetBrainsFont = fontLoader.parse(json);
      // Use parsed font as normal.
      const HellotextGeometry = new TextGeometry("Hello, I'm a", {
        size: 0.09,
        font: jetBrainsFont,
      });
      const GraphicstextGeometry = new TextGeometry("Graphics Engineer", {
        size: 0.09,
        font: jetBrainsFont,
      });
      const textMaterial = createStandardMaterial("#bda27c")
      const textMesh1 = new Mesh(HellotextGeometry, textMaterial);
      const textMesh2 = new Mesh(GraphicstextGeometry, textMaterial);
      textMesh1.position.x = -0.85;
      textMesh1.position.y = 1;
      textMesh1.scale.z = 0.0009;
      scene.add(textMesh1);

      textMesh2.position.x = -0.85;
      textMesh2.position.y = 0.85;
      textMesh2.scale.z = 0.0009;
      scene.add(textMesh2);
    });


  }

  // ===== 📦 OBJECTS =====
  {
    const sideLength = 1
    const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const cubeMaterial = new MeshStandardMaterial({
      color: '#f69f1f',
      metalness: 0.5,
      roughness: 0.7,
    })
    cube = new Mesh(cubeGeometry, cubeMaterial)
    cube.castShadow = true
    cube.position.y = 0.5



    //scene.add(cube)


    // Create and add the cuboid#47ad43
    const Backcuboid = createRoundedCuboid(2, 1.57, 0.05, 0.04, "#c78c55");
    scene.add(Backcuboid);
    Backcuboid.position.set(0, 0.535, -0.05);

    cuboid = createRoundedCuboid(2, 1.5, 0.05, 0.04, "#e7d3b8");
    scene.add(cuboid);
    cuboid.position.set(0, 0.5, 0);
    cuboid.receiveShadow = true

    
    addSphere({ x: -0.95, y: 1.285, z: -0.03 }, { x: 0.02, y: 0.02, z: 0.02},"#ff4d4d")
    addSphere({ x: -0.9, y: 1.285, z: -0.03 }, { x: 0.02, y: 0.02, z: 0.02},"#ffd358")
    addSphere({ x: -0.85, y: 1.285, z: -0.03 }, { x: 0.02, y: 0.02, z: 0.02},"#47ad43")

  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(10, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(2, 2, 5)
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas)
    cameraControls.target = cube.position.clone()
    cameraControls.autoRotate = false
    // Set mouse rotation speed
    cameraControls.rotateSpeed = 0.5; // Higher value = faster rotation

    // Optional: Enable damping for smoother controls
    cameraControls.enableDamping = true;
    cameraControls.dampingFactor = 0.05;

    // Set zoom limits (min/max distance from target)
    cameraControls.minDistance = 10;   // Adjust as needed
    cameraControls.maxDistance = 25;  // Adjust as needed
    // Constrain vertical rotation (polar angle)
    cameraControls.minPolarAngle = Math.PI / 2 - Math.PI / 12; // 90° - 15° = 75°
    cameraControls.maxPolarAngle = Math.PI / 2 + Math.PI / 12; // 90° + 15° = 105°
    // === Set current distance and angles ===
    const distance = 15;               // Desired zoom distance
    const polarAngle = Math.PI / 4;    // Vertical angle (0 = top, Math.PI = bottom)
    const azimuthalAngle = -Math.PI / 6; // Horizontal angle (around the target)

    // Convert spherical to Cartesian coordinates
    const spherical = new Spherical(distance, polarAngle, azimuthalAngle);
    const offset = new Vector3().setFromSpherical(spherical);

    // Set camera position based on target and offset
    camera.position.copy(cube.position).add(offset);

    // Constrain horizontal rotation (azimuthal angle)
    //cameraControls.minAzimuthAngle = -Math.PI / 6; // -30°
    //cameraControls.maxAzimuthAngle = Math.PI / 6;  // +30°
    cameraControls.update()

    dragControls = new DragControls([cube], camera, renderer.domElement)
    dragControls.addEventListener('hoveron', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('orange')
    })
    dragControls.addEventListener('hoveroff', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
    })
    dragControls.addEventListener('dragstart', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      cameraControls.enabled = false
      animation.play = false
      material.emissive.set('black')
      material.opacity = 0.7
      material.needsUpdate = true
    })
    dragControls.addEventListener('dragend', (event) => {
      cameraControls.enabled = true
      animation.play = true
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
      material.opacity = 1
      material.needsUpdate = true
    })
    dragControls.enabled = false

    mouse = new Vector2();
    raycaster = new Raycaster();
    window.addEventListener('click', onMouseClick, false);
    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === canvas) {
        toggleFullScreen(canvas)
      }
    })
  }

  // ===== 🪄 HELPERS =====
  {
    axesHelper = new AxesHelper(4)
    axesHelper.visible = false
    //scene.add(axesHelper)

    pointLightHelper = new PointLightHelper(pointLight, undefined, 'orange')
    pointLightHelper.visible = false
    scene.add(pointLightHelper)

    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    //scene.add(gridHelper)


  }

  // ===== 📈 STATS & CLOCK =====
  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

    const cubeOneFolder = gui.addFolder('Cube one')

    cubeOneFolder.add(cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
    cubeOneFolder
      .add(cube.position, 'y')
      .min(-5)
      .max(5)
      .step(1)
      .name('pos y')
      .onChange(() => (animation.play = false))
      .onFinishChange(() => (animation.play = true))
    cubeOneFolder.add(cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

    cubeOneFolder.add(cube.material, 'wireframe')
    cubeOneFolder.addColor(cube.material, 'color')
    cubeOneFolder.add(cube.material, 'metalness', 0, 1, 0.1)
    cubeOneFolder.add(cube.material, 'roughness', 0, 1, 0.1)

    cubeOneFolder
      .add(cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate x')
    cubeOneFolder
      .add(cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate y')
      .onChange(() => (animation.play = false))
      .onFinishChange(() => (animation.play = true))
    cubeOneFolder
      .add(cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate z')

    cubeOneFolder.add(animation, 'enabled').name('animated')

    const controlsFolder = gui.addFolder('Controls')
    controlsFolder.add(dragControls, 'enabled').name('drag controls')

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(pointLight, 'visible').name('point light')
    lightsFolder.add(ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(axesHelper, 'visible').name('axes')
    helpersFolder.add(pointLightHelper, 'visible').name('pointLight')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(cameraControls, 'autoRotate')

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')
    addEventListener("wheel", (event) => { });
    onwheel = (event) => { console.log(event) };
    gui.close()
  }
}

function animate() {
  requestAnimationFrame(animate)

  stats.update()

  if (animation.enabled && animation.play) {
    animations.rotate(cube, clock, Math.PI / 3)
    animations.bounce(cube, clock, 1, 0.5, 0.5)
  }

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
  }

  cameraControls.update()

  renderer.render(scene, camera)
}

function createRoundedCuboid(length = 2, width = 1, height = 1, cornerRadius = 0.1, hexcode = "#C595C5") {
  const shape = new Shape();

  const lx = length / 2;
  const lz = width / 2;
  const r = cornerRadius;

  shape.moveTo(-lx + r, -lz);
  shape.lineTo(lx - r, -lz);
  shape.quadraticCurveTo(lx, -lz, lx, -lz + r);
  shape.lineTo(lx, lz - r);
  shape.quadraticCurveTo(lx, lz, lx - r, lz);
  shape.lineTo(-lx + r, lz);
  shape.quadraticCurveTo(-lx, lz, -lx, lz - r);
  shape.lineTo(-lx, -lz + r);
  shape.quadraticCurveTo(-lx, -lz, -lx + r, -lz);

  const extrudeSettings = {
    depth: height,
    bevelEnabled: false,
  };
  const geometry = new ExtrudeGeometry(shape, extrudeSettings);
  geometry.center(); // Optional: centers the geometry

  const material = createStandardMaterial(hexcode);


  const mesh = new Mesh(geometry, material);
  return mesh;
}

function onMouseClick(event: { clientX: number; clientY: number }) {
  // Convert mouse to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cuboid);

  if (intersects.length > 0) {
    console.log("hello");
  }
}

function createStandardMaterial(hexCode = '#ffffff') {
  return new MeshStandardMaterial({
    color: new Color(hexCode), // Accepts string like '#ff4d4d'
    roughness: 1,
    metalness: 0,
    flatShading: true // Optional: gives a more diffuse, simple look
  });
}
function createGlassMaterial(color = '#ffffff', opacity = 0.25, ior = 1.5) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    metalness: 0,             // Glass isn't metallic
    roughness: 0,             // Smooth surface
    transmission: 1,          // Enables real transparency
    opacity: opacity,         // Controls visible transparency
    transparent: true,        // Required for transmission
    ior: ior,                 // Index of Refraction (1.5 is typical for glass)
    thickness: 0.5,           // Controls internal refraction depth
    reflectivity: 0.5,        // Some reflection
    clearcoat: 1,             // Optional: gives a polished layer on top
    clearcoatRoughness: 0
  });
}

function addSphere(position = { x: 0, y: 0, z: 0 }, scale = { x: 1, y: 1, z: 1 },hexCode = '#ffffff') {
  const geometry = new SphereGeometry(1, 32, 32); // radius = 1 by default
  const material = createStandardMaterial(hexCode)
  const sphere = new Mesh(geometry, material);

  // Set position
  sphere.position.set(position.x, position.y, position.z);

  // Set scale
  sphere.scale.set(scale.x, scale.y, scale.z);

  // Add to scene
  scene.add(sphere);

  return sphere;
}
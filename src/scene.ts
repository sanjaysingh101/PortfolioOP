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
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Raycaster,
  Scene,
  Shape,
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

  //
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
    ambientLight = new AmbientLight('white', 3.5)
    pointLight = new PointLight('white', 20, 100)
    pointLight.position.set(-2, 2, 2)
    pointLight.castShadow = false
    pointLight.shadow.radius = 4
    pointLight.shadow.camera.near = 0.5
    pointLight.shadow.camera.far = 4000
    pointLight.shadow.mapSize.width = 2048
    pointLight.shadow.mapSize.height = 2048
    scene.add(ambientLight)
    //scene.add(pointLight)
  }
  // === Loading custom fonts
  {
    const fontLoader = new FontLoader();
    const ttfLoader = new TTFLoader();
    ttfLoader.load('fonts/poppins.medium.ttf', (json) => {
      // First parse the font.
      const jetBrainsFont = fontLoader.parse(json);
      // Use parsed font as normal.
      const textGeometry = new TextGeometry('Portfolio OP', {
        size: 0.11,
        font: jetBrainsFont,
      });
      const textMaterial = createStandardMaterial("#c78c55")
      const textMesh = new Mesh(textGeometry, textMaterial);
      textMesh.castShadow = true
      textMesh.position.x = -0.85;
      textMesh.position.y = 1;
      textMesh.scale.z = 0.0009
      ;
      scene.add(textMesh);
    });


  }


  //
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

    const planeGeometry = new PlaneGeometry(3, 3)
    const planeMaterial = new MeshLambertMaterial({
      color: 'gray',
      emissive: 'teal',
      emissiveIntensity: 0.2,
      side: 2,
      transparent: true,
      opacity: 0.4,
    })
    const plane = new Mesh(planeGeometry, planeMaterial)
    plane.rotateX(Math.PI / 2)
    plane.receiveShadow = true

    //scene.add(cube)
    //scene.add(plane)


    // Create and add the cuboid #ffca84
    const Backcuboid = createRoundedCuboid(1.2, 0.6, 0.02, 0.05, "#c78c55");
    scene.add(Backcuboid);
    Backcuboid.position.set(0.4, 1, -0.05);

    cuboid = createRoundedCuboid(2, 1.5, 0.05, 0.04, "#ffffff");
    scene.add(cuboid);
    cuboid.position.set(0, 0.5, 0);
    cuboid.receiveShadow = true

  }

  // ===== 🎥 CAMERA =====
  {
    camera = new PerspectiveCamera(20, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
    camera.position.set(2, 2, 5)
  }

  // ===== 🕹️ CONTROLS =====
  {
    cameraControls = new OrbitControls(camera, canvas)
    cameraControls.target = cube.position.clone()
    cameraControls.enableDamping = true
    cameraControls.autoRotate = false
    // Constrain vertical rotation (polar angle)
    cameraControls.minPolarAngle = Math.PI / 2 - Math.PI / 12; // 90° - 15° = 75°
    cameraControls.maxPolarAngle = Math.PI / 2 + Math.PI / 12; // 90° + 15° = 105°

    // Constrain horizontal rotation (azimuthal angle)
    cameraControls.minAzimuthAngle = -Math.PI / 6; // -30°
    cameraControls.maxAzimuthAngle = Math.PI / 6;  // +30°
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
    color: new Color(hexCode), // Accepts string like '#C595C5'
    roughness: 0.5,
    metalness: 0.3,
  });
}
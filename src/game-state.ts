import { makeAutoObservable, observable } from "mobx";
import * as THREE from "three";

export class GameState {
  @observable score = 0;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();

  private boxes: THREE.Mesh[] = [];
  private maxBoxes = 10;

  constructor() {
    makeAutoObservable(this);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;

    // Add canvas to dom
    const canvas = this.renderer.domElement;
    const canvasRoot = document.getElementById("canvas-root");
    canvasRoot?.appendChild(canvas);

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(5, 1, 10);

    // Handle any canvas resize events
    window.addEventListener("resize", this.onCanvasResize);
    this.onCanvasResize();

    this.scene.background = new THREE.Color("#1680AF");

    // Lighting
    const ambientLight = new THREE.AmbientLight(undefined, 0.25);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(undefined, Math.PI);
    directLight.position.copy(new THREE.Vector3(0.75, 1, 0.75).normalize());
    this.scene.add(directLight);

    const axesHelper = new THREE.AxesHelper(10);
    this.scene.add(axesHelper);

    // Add starting boxes
    for (let i = 0; i < this.maxBoxes; i++) {
      this.createBox();
    }

    window.addEventListener("pointerdown", this.onClick);

    // Start game
    this.update();
  }

  private createBox() {
    const geometry = new THREE.BoxGeometry();
    const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
    const material = new THREE.MeshStandardMaterial({ color });
    const box = new THREE.Mesh(geometry, material);

    box.position.x = Math.random() * 10;
    box.position.y = 10;

    this.scene.add(box);
    this.boxes.push(box);
  }

  private destroyBox(index: number) {
    const box = this.boxes[index];

    box.geometry.dispose();
    (box.material as THREE.MeshStandardMaterial).dispose();

    this.scene.remove(box);
    this.boxes.splice(index, 1);
  }

  private onCanvasResize = () => {
    const canvas = this.renderer.domElement;

    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;

    this.camera.updateProjectionMatrix();
  };

  private onClick = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const clickCoords = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    clickCoords.x /= rect.width;
    clickCoords.y /= rect.height;

    clickCoords.y = 1.0 - clickCoords.y;

    clickCoords.x = clickCoords.x * 2.0 - 1.0;
    clickCoords.y = clickCoords.y * 2.0 - 1.0;

    const ndc = new THREE.Vector2(clickCoords.x, clickCoords.y);

    this.raycaster.setFromCamera(ndc, this.camera);

    const intersections = this.raycaster.intersectObjects(this.boxes);
    if (intersections.length) {
      const hitObject = intersections[0].object as THREE.Mesh;
      const boxIndex = this.boxes.findIndex((box) => box === hitObject);
      this.destroyBox(boxIndex);
      this.score++;
    }
  };

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    for (let i = this.boxes.length; i--; ) {
      const box = this.boxes[i];

      // Move down
      box.position.y -= dt;

      // If below cut-off point
      if (box.position.y < 0) {
        this.destroyBox(i);
        this.score--;
      }
    }

    const toSpawn = this.maxBoxes - this.boxes.length;
    for (let i = 0; i < toSpawn; i++) {
      this.createBox();
    }

    this.renderer.render(this.scene, this.camera);
  };
}

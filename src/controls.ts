import * as THREE from 'three';
import { Controls } from './types';

export class ControlsManager {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private aimLine: THREE.Line | null = null;
  private getBallPosition: () => THREE.Vector3;
  
  public controls: Controls = {
    isDragging: false,
    dragStart: new THREE.Vector2(),
    dragCurrent: new THREE.Vector2(),
    maxPower: 15
  };

  private onPutt: (power: number, direction: THREE.Vector2) => void;

  constructor(
    canvas: HTMLCanvasElement, 
    camera: THREE.Camera, 
    scene: THREE.Scene,
    onPutt: (power: number, direction: THREE.Vector2) => void,
    getBallPosition: () => THREE.Vector3
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;
    this.onPutt = onPutt;
    this.getBallPosition = getBallPosition;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.handlePointerDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handlePointerUp.bind(this));

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handlePointerDown(event: MouseEvent): void {
    this.startDrag(event.clientX, event.clientY);
  }

  private handlePointerMove(event: MouseEvent): void {
    if (this.controls.isDragging) {
      this.updateDrag(event.clientX, event.clientY);
    }
  }

  private handlePointerUp(): void {
    this.endDrag();
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.startDrag(touch.clientX, touch.clientY);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1 && this.controls.isDragging) {
      const touch = event.touches[0];
      this.updateDrag(touch.clientX, touch.clientY);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    // Only fire endDrag when all fingers have been lifted
    if (event.touches.length === 0) {
      this.endDrag();
    }
  }

  private startDrag(clientX: number, clientY: number): void {
    this.controls.isDragging = true;
    this.controls.dragStart.set(clientX, clientY);
    this.controls.dragCurrent.set(clientX, clientY);
  }

  private updateDrag(clientX: number, clientY: number): void {
    this.controls.dragCurrent.set(clientX, clientY);
    this.updateAimLine();
  }

  private endDrag(): void {
    if (!this.controls.isDragging) return;

    const dragVector = new THREE.Vector2()
      .subVectors(this.controls.dragStart, this.controls.dragCurrent);
    
    const power = Math.min(dragVector.length() / 50, this.controls.maxPower);
    
    if (power > 0.5) { // Minimum power threshold
      // Raycast to get world-space direction (same as aim line)
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      
      const startNDC = new THREE.Vector2(
        (this.controls.dragStart.x / window.innerWidth) * 2 - 1,
        -(this.controls.dragStart.y / window.innerHeight) * 2 + 1
      );
      const currentNDC = new THREE.Vector2(
        (this.controls.dragCurrent.x / window.innerWidth) * 2 - 1,
        -(this.controls.dragCurrent.y / window.innerHeight) * 2 + 1
      );

      this.raycaster.setFromCamera(startNDC, this.camera);
      const startWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(groundPlane, startWorld);

      this.raycaster.setFromCamera(currentNDC, this.camera);
      const currentWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(groundPlane, currentWorld);

      const worldDir = new THREE.Vector3().subVectors(startWorld, currentWorld);
      worldDir.y = 0;
      const direction = new THREE.Vector2(worldDir.x, worldDir.z).normalize();
      this.onPutt(power, direction);
    }

    this.controls.isDragging = false;
    this.hideAimLine();
  }

  private updateAimLine(): void {
    const dragVector = new THREE.Vector2()
      .subVectors(this.controls.dragStart, this.controls.dragCurrent);
    
    if (dragVector.length() < 10) {
      this.hideAimLine();
      return;
    }

    // Raycast drag start and current positions onto the ground plane (y=0)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    const startNDC = new THREE.Vector2(
      (this.controls.dragStart.x / window.innerWidth) * 2 - 1,
      -(this.controls.dragStart.y / window.innerHeight) * 2 + 1
    );
    const currentNDC = new THREE.Vector2(
      (this.controls.dragCurrent.x / window.innerWidth) * 2 - 1,
      -(this.controls.dragCurrent.y / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(startNDC, this.camera);
    const startWorld = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, startWorld);

    this.raycaster.setFromCamera(currentNDC, this.camera);
    const currentWorld = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, currentWorld);

    if (!startWorld || !currentWorld) return;

    // Direction is opposite of drag (slingshot: pull back to shoot forward)
    const worldDrag = new THREE.Vector3().subVectors(startWorld, currentWorld);
    worldDrag.y = 0;
    
    const power = Math.min(dragVector.length() / 50, this.controls.maxPower);
    const lineLength = power * 0.5;
    const direction = worldDrag.normalize();

    // Read the ball's current position dynamically
    const ballPos = this.getBallPosition();
    const start = new THREE.Vector3(ballPos.x, ballPos.y + 0.1, ballPos.z);
    const end = start.clone().add(direction.clone().multiplyScalar(lineLength));

    this.showAimLine(start, end, power);
  }

  private showAimLine(start: THREE.Vector3, end: THREE.Vector3, power: number): void {
    this.hideAimLine();

    const points = [];
    const segments = 10;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = new THREE.Vector3().lerpVectors(start, end, t);
      
      // Add slight arc for visual effect
      point.y += Math.sin(t * Math.PI) * 0.1;
      points.push(point);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Color based on power (green = low, yellow = medium, red = high)
    const powerRatio = power / this.controls.maxPower;
    const color = new THREE.Color().setHSL(
      (1 - powerRatio) * 0.3, // Hue: green to red
      0.8, // Saturation
      0.6  // Lightness
    );
    
    const material = new THREE.LineBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.8
    });
    
    this.aimLine = new THREE.Line(geometry, material);
    this.scene.add(this.aimLine);
  }

  private hideAimLine(): void {
    if (this.aimLine) {
      this.scene.remove(this.aimLine);
      this.aimLine = null;
    }
  }
}

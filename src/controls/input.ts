import * as THREE from 'three';
import { GameStateKind } from '../gameplay/state-machine';

export class InputManager {
  private canvas: HTMLCanvasElement;
  private camera: THREE.Camera;
  private raycaster = new THREE.Raycaster();

  public isDragging = false;
  public dragStart = new THREE.Vector2();
  public dragCurrent = new THREE.Vector2();
  public readonly maxPower = 15;

  private getState: () => GameStateKind;
  private getBallPosition: () => THREE.Vector3;
  private onPutt: (power: number, direction: THREE.Vector2) => void;
  private onDragStart: () => void;
  private onDragUpdate: () => void;
  private onDragEnd: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    getState: () => GameStateKind,
    getBallPosition: () => THREE.Vector3,
    onPutt: (power: number, direction: THREE.Vector2) => void,
    onDragStart: () => void,
    onDragUpdate: () => void,
    onDragEnd: () => void,
  ) {
    this.canvas = canvas;
    this.camera = camera;
    this.getState = getState;
    this.getBallPosition = getBallPosition;
    this.onPutt = onPutt;
    this.onDragStart = onDragStart;
    this.onDragUpdate = onDragUpdate;
    this.onDragEnd = onDragEnd;
    this.setup();
  }

  private setup(): void {
    this.canvas.addEventListener('mousedown', (e) => this.handleDown(e.clientX, e.clientY));
    this.canvas.addEventListener('mousemove', (e) => { if (this.isDragging) this.handleMove(e.clientX, e.clientY); });
    this.canvas.addEventListener('mouseup', () => this.handleUp());
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); if (e.touches.length === 1) this.handleDown(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (e.touches.length === 1 && this.isDragging) this.handleMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); if (e.touches.length === 0) this.handleUp(); }, { passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private screenDistanceToBall(clientX: number, clientY: number): number {
    const ballPos = this.getBallPosition();
    const projected = ballPos.clone().project(this.camera);
    const bx = (projected.x + 1) / 2 * window.innerWidth;
    const by = (1 - projected.y) / 2 * window.innerHeight;
    const dx = clientX - bx;
    const dy = clientY - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private handleDown(clientX: number, clientY: number): void {
    const state = this.getState();
    if (state !== GameStateKind.Idle) return;
    if (this.screenDistanceToBall(clientX, clientY) > 200) return;

    this.isDragging = true;
    this.dragStart.set(clientX, clientY);
    this.dragCurrent.set(clientX, clientY);
    this.onDragStart();
  }

  private handleMove(clientX: number, clientY: number): void {
    this.dragCurrent.set(clientX, clientY);
    this.onDragUpdate();
  }

  private handleUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.onDragEnd();

    const dragVec = new THREE.Vector2().subVectors(this.dragStart, this.dragCurrent);
    const power = Math.min(dragVec.length() / 50, this.maxPower);

    if (power > 0.5) {
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

      const toNDC = (cx: number, cy: number) => new THREE.Vector2(
        (cx / window.innerWidth) * 2 - 1,
        -(cy / window.innerHeight) * 2 + 1
      );

      this.raycaster.setFromCamera(toNDC(this.dragStart.x, this.dragStart.y), this.camera);
      const startWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(groundPlane, startWorld);

      this.raycaster.setFromCamera(toNDC(this.dragCurrent.x, this.dragCurrent.y), this.camera);
      const currentWorld = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(groundPlane, currentWorld);

      const dir3 = new THREE.Vector3().subVectors(startWorld, currentWorld);
      dir3.y = 0;
      const direction = new THREE.Vector2(dir3.x, dir3.z).normalize();
      this.onPutt(power, direction);
    }
  }

  public getAimWorldPoints(): { start: THREE.Vector3; end: THREE.Vector3; power: number } | null {
    const dragVec = new THREE.Vector2().subVectors(this.dragStart, this.dragCurrent);
    if (dragVec.length() < 10) return null;

    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const toNDC = (cx: number, cy: number) => new THREE.Vector2(
      (cx / window.innerWidth) * 2 - 1,
      -(cy / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(toNDC(this.dragStart.x, this.dragStart.y), this.camera);
    const startWorld = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, startWorld);

    this.raycaster.setFromCamera(toNDC(this.dragCurrent.x, this.dragCurrent.y), this.camera);
    const currentWorld = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(groundPlane, currentWorld);

    const dir = new THREE.Vector3().subVectors(startWorld, currentWorld);
    dir.y = 0;
    dir.normalize();

    const power = Math.min(dragVec.length() / 50, this.maxPower);
    const ballPos = this.getBallPosition();
    const start = new THREE.Vector3(ballPos.x, ballPos.y + 0.1, ballPos.z);
    const end = start.clone().add(dir.multiplyScalar(power * 0.5));

    return { start, end, power };
  }
}

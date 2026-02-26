import * as THREE from 'three';
import { GameObjects } from './types';

export class Course {
  private scene: THREE.Scene;
  public objects: GameObjects;

  // Course dimensions — narrow straight fairway
  static readonly LENGTH = 10;    // long axis (Z)
  static readonly WIDTH = 3;      // short axis (X)
  static readonly WALL_H = 0.3;
  static readonly WALL_T = 0.12;  // wall thickness

  // Positions
  static readonly TEE_Z = 4;      // ball starts near +Z end
  static readonly HOLE_Z = -4;    // hole near -Z end

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.objects = {
      ball: new THREE.Mesh(),
      green: new THREE.Mesh(),
      walls: [],
      hole: new THREE.Mesh()
    };
    this.createCourse();
  }

  private createCourse(): void {
    this.createGreen();
    this.createWalls();
    this.createHole();
    this.createTeeMarker();
    this.createBall();
    this.createSurroundings();
  }

  private createGreen(): void {
    const geometry = new THREE.BoxGeometry(Course.WIDTH, 0.1, Course.LENGTH);
    const material = new THREE.MeshLambertMaterial({
      color: 0x4CAF50,
      flatShading: true
    });

    this.objects.green = new THREE.Mesh(geometry, material);
    this.objects.green.receiveShadow = true;
    this.objects.green.position.set(0, 0, 0);
    this.scene.add(this.objects.green);
  }

  private createWalls(): void {
    const wallMaterial = new THREE.MeshLambertMaterial({
      color: 0x8D6E63,
      flatShading: true
    });

    const W = Course.WIDTH;
    const L = Course.LENGTH;
    const H = Course.WALL_H;
    const T = Course.WALL_T;

    const walls = [
      // Left wall
      { x: -(W / 2 + T / 2), y: H / 2, z: 0, w: T, h: H, d: L + T * 2 },
      // Right wall
      { x: (W / 2 + T / 2), y: H / 2, z: 0, w: T, h: H, d: L + T * 2 },
      // Back wall (far end, near hole)
      { x: 0, y: H / 2, z: -(L / 2 + T / 2), w: W + T * 2, h: H, d: T },
      // Front wall (tee end) — with a small opening feel but still closed
      { x: 0, y: H / 2, z: (L / 2 + T / 2), w: W + T * 2, h: H, d: T },
    ];

    walls.forEach(wall => {
      const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
      const mesh = new THREE.Mesh(geometry, wallMaterial);
      mesh.position.set(wall.x, wall.y, wall.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.objects.walls.push(mesh);
      this.scene.add(mesh);
    });

    // Bumper rails — two small cylinders mid-fairway to add some challenge
    const bumperMaterial = new THREE.MeshLambertMaterial({
      color: 0xF44336,
      flatShading: true
    });
    const bumperGeo = new THREE.CylinderGeometry(0.15, 0.15, H, 8);

    const bumper1 = new THREE.Mesh(bumperGeo, bumperMaterial);
    bumper1.position.set(-0.6, H / 2, -1);
    bumper1.castShadow = true;
    this.objects.walls.push(bumper1);
    this.scene.add(bumper1);

    const bumper2 = new THREE.Mesh(bumperGeo, bumperMaterial);
    bumper2.position.set(0.6, H / 2, 0.5);
    bumper2.castShadow = true;
    this.objects.walls.push(bumper2);
    this.scene.add(bumper2);
  }

  private createHole(): void {
    // Visual cup — open cylinder going below the green surface
    const cupDepth = 0.3;
    const cupRadius = 0.18;

    // Cup interior (dark cylinder below surface)
    const cupGeo = new THREE.CylinderGeometry(cupRadius, cupRadius, cupDepth, 16, 1, true);
    const cupMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, side: THREE.BackSide });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.set(0, -cupDepth / 2 + 0.05, Course.HOLE_Z);
    this.scene.add(cup);

    // Cup floor
    const floorGeo = new THREE.CircleGeometry(cupRadius, 16);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0.05 - cupDepth, Course.HOLE_Z);
    this.scene.add(floor);

    // Rim ring
    const rimGeo = new THREE.TorusGeometry(cupRadius, 0.02, 8, 24);
    const rimMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(0, 0.06, Course.HOLE_Z);
    this.scene.add(rim);

    // Invisible mesh for position tracking
    this.objects.hole = new THREE.Mesh();
    this.objects.hole.position.set(0, 0.05, Course.HOLE_Z);

    // Flag pole
    const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(0.15, 0.6, Course.HOLE_Z);
    pole.castShadow = true;
    this.scene.add(pole);

    // Flag
    const flagGeo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      0, 0, 0,
      0.4, -0.1, 0,
      0, -0.25, 0
    ]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    flagGeo.computeVertexNormals();
    const flagMat = new THREE.MeshLambertMaterial({
      color: 0xFF5722,
      side: THREE.DoubleSide
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.set(0.15, 1.2, Course.HOLE_Z);
    this.scene.add(flag);
  }

  private createTeeMarker(): void {
    // Small tee pad (slightly different shade)
    const teeGeo = new THREE.BoxGeometry(1.2, 0.02, 0.8);
    const teeMat = new THREE.MeshLambertMaterial({ color: 0x66BB6A });
    const tee = new THREE.Mesh(teeGeo, teeMat);
    tee.position.set(0, 0.06, Course.TEE_Z);
    this.scene.add(tee);
  }

  private createBall(): void {
    const ballGeometry = new THREE.SphereGeometry(0.1, 16, 12);
    const ballMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF,
      flatShading: true
    });

    this.objects.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.objects.ball.position.set(0, 0.15, Course.TEE_Z);
    this.objects.ball.castShadow = true;
    this.scene.add(this.objects.ball);
  }

  private createSurroundings(): void {
    // Ground plane around the course (darker green / dirt)
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x3E8E41 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  public updateBallPosition(x: number, y: number, z: number): void {
    this.objects.ball.position.set(x, y, z);
  }

  public getBallPosition(): THREE.Vector3 {
    return this.objects.ball.position.clone();
  }

  public getHolePosition(): THREE.Vector3 {
    return this.objects.hole.position.clone();
  }
}

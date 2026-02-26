import * as THREE from 'three';
import { GameObjects } from './types';

export class Course {
  private scene: THREE.Scene;
  public objects: GameObjects;

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
    this.createBall();
  }

  private createGreen(): void {
    const geometry = new THREE.BoxGeometry(12, 0.1, 8);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x4CAF50, // Green color
      flatShading: true 
    });
    
    this.objects.green = new THREE.Mesh(geometry, material);
    this.objects.green.receiveShadow = true;
    this.objects.green.position.set(0, 0, 0);
    this.scene.add(this.objects.green);
  }

  private createWalls(): void {
    const wallMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x8D6E63, // Brown color
      flatShading: true 
    });

    // Wall positions and dimensions
    const walls = [
      { x: 0, y: 0.25, z: -4.05, w: 12.1, h: 0.5, d: 0.1 }, // Back wall
      { x: 0, y: 0.25, z: 4.05, w: 12.1, h: 0.5, d: 0.1 },  // Front wall
      { x: -6.05, y: 0.25, z: 0, w: 0.1, h: 0.5, d: 8.1 },  // Left wall
      { x: 6.05, y: 0.25, z: 0, w: 0.1, h: 0.5, d: 8.1 },   // Right wall
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

    // Add some curved elements for visual interest
    const curveGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 8);
    const curve1 = new THREE.Mesh(curveGeometry, wallMaterial);
    curve1.position.set(-4, 0.25, -2);
    curve1.scale.set(0.8, 1, 0.8);
    curve1.castShadow = true;
    this.objects.walls.push(curve1);
    this.scene.add(curve1);

    const curve2 = new THREE.Mesh(curveGeometry, wallMaterial);
    curve2.position.set(3, 0.25, 1);
    curve2.scale.set(0.6, 1, 0.6);
    curve2.castShadow = true;
    this.objects.walls.push(curve2);
    this.scene.add(curve2);
  }

  private createHole(): void {
    // Visual hole (black cylinder)
    const holeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
    const holeMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x000000, // Black
      flatShading: true 
    });
    
    this.objects.hole = new THREE.Mesh(holeGeometry, holeMaterial);
    this.objects.hole.position.set(4, 0.05, -2);
    this.scene.add(this.objects.hole);
  }

  private createBall(): void {
    const ballGeometry = new THREE.SphereGeometry(0.1, 16, 12);
    const ballMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xFFFFFF, // White
      flatShading: true 
    });
    
    this.objects.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    this.objects.ball.position.set(-4, 0.2, 2); // Starting position (tee)
    this.objects.ball.castShadow = true;
    this.scene.add(this.objects.ball);
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
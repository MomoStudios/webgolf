import * as THREE from 'three';

export class Ball {
  public mesh!: THREE.Mesh;
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createBall();
  }

  private createBall(): void {
    const geometry = new THREE.SphereGeometry(0.1, 16, 12);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0xFFFFFF,
      flatShading: true 
    });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(-4, 0.2, 2); // Starting position
    this.mesh.castShadow = true;
    this.scene.add(this.mesh);
  }

  public updatePosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
}
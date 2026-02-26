import * as THREE from 'three';
import type RAPIER_TYPE from '@dimforge/rapier3d';

type RapierModule = typeof RAPIER_TYPE;

export class BallController {
  public mesh: THREE.Mesh;
  private body: RAPIER_TYPE.RigidBody;
  private RAPIER: RapierModule;

  constructor(mesh: THREE.Mesh, body: RAPIER_TYPE.RigidBody, RAPIER: RapierModule) {
    this.mesh = mesh;
    this.body = body;
    this.RAPIER = RAPIER;
  }

  public syncVisual(): void {
    const t = this.body.translation();
    this.mesh.position.set(t.x, t.y, t.z);
  }

  public getPosition(): THREE.Vector3 {
    const t = this.body.translation();
    return new THREE.Vector3(t.x, t.y, t.z);
  }

  public getSpeed(): number {
    const v = this.body.linvel();
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  }

  /** Force-stop if crawling */
  public forceStopIfSlow(threshold = 0.05): boolean {
    if (this.getSpeed() < threshold) {
      const RAPIER = this.RAPIER;
      this.body.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
      this.body.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
      return true;
    }
    return false;
  }

  public applyImpulse(x: number, z: number): void {
    this.body.applyImpulse(new this.RAPIER.Vector3(x, 0, z), true);
  }

  public reset(x: number, y: number, z: number): void {
    this.body.setTranslation(new this.RAPIER.Vector3(x, y, z), true);
    this.body.setLinvel(new this.RAPIER.Vector3(0, 0, 0), true);
    this.body.setAngvel(new this.RAPIER.Vector3(0, 0, 0), true);
  }
}

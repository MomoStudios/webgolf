import type RAPIER_TYPE from '@dimforge/rapier3d';

type RapierModule = typeof RAPIER_TYPE;

const FIXED_TIMESTEP = 1 / 60;
const MAX_STEPS = 5;

export class PhysicsManager {
  public world!: RAPIER_TYPE.World;
  public RAPIER!: RapierModule;
  private accumulator = 0;

  public async initialize(): Promise<void> {
    this.RAPIER = await import('@dimforge/rapier3d');
    this.world = new this.RAPIER.World(new this.RAPIER.Vector3(0, -9.81, 0));
  }

  public createBall(x: number, y: number, z: number): RAPIER_TYPE.RigidBody {
    const RAPIER = this.RAPIER;
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, z)
      .setCcdEnabled(true)
      .setLinearDamping(1.5)
      .setAngularDamping(1.0);
    const body = this.world.createRigidBody(desc);
    this.world.createCollider(
      RAPIER.ColliderDesc.ball(0.1)
        .setRestitution(0.4)
        .setFriction(0.8)
        .setDensity(1.0),
      body
    );
    return body;
  }

  /** Accumulate dt and step physics up to MAX_STEPS times */
  public step(dt: number): void {
    this.accumulator += dt;
    let steps = 0;
    while (this.accumulator >= FIXED_TIMESTEP && steps < MAX_STEPS) {
      this.world.step();
      this.accumulator -= FIXED_TIMESTEP;
      steps++;
    }
  }
}

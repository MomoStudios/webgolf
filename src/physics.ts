export class PhysicsManager {
  public world!: any;
  public ballBody!: any;
  public eventQueue!: any;

  constructor() {
    // Physics world will be initialized when passed RAPIER
  }

  public async initialize(): Promise<void> {
    const RAPIER = await import('@dimforge/rapier3d');
    // Initialize physics world with gravity
    this.world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0));
    this.eventQueue = new RAPIER.EventQueue(true);
  }

  public async createBall(x: number, y: number, z: number): Promise<any> {
    const RAPIER = await import('@dimforge/rapier3d');
    const ballDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    this.ballBody = this.world.createRigidBody(ballDesc);
    
    const ballCollider = RAPIER.ColliderDesc.ball(0.1) // Ball radius
      .setRestitution(0.4)
      .setFriction(0.8)
      .setDensity(1.0);
    
    this.world.createCollider(ballCollider, this.ballBody);
    return this.ballBody;
  }

  public async createGreen(width: number, length: number): Promise<void> {
    const RAPIER = await import('@dimforge/rapier3d');
    const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.05, 0.0);
    const groundBody = this.world.createRigidBody(groundDesc);
    
    const groundCollider = RAPIER.ColliderDesc.cuboid(width / 2, 0.05, length / 2)
      .setRestitution(0.2)
      .setFriction(0.9);
    
    this.world.createCollider(groundCollider, groundBody);
  }

  public async createWall(x: number, y: number, z: number, width: number, height: number, depth: number): Promise<void> {
    const RAPIER = await import('@dimforge/rapier3d');
    const wallDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    const wallBody = this.world.createRigidBody(wallDesc);
    
    const wallCollider = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
      .setRestitution(0.6)
      .setFriction(0.8);
    
    this.world.createCollider(wallCollider, wallBody);
  }

  public async createHole(x: number, y: number, z: number): Promise<void> {
    const RAPIER = await import('@dimforge/rapier3d');
    // Create a sensor collider for the hole (no physical collision, just detection)
    const holeDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    const holeBody = this.world.createRigidBody(holeDesc);
    
    const holeCollider = RAPIER.ColliderDesc.cylinder(0.05, 0.15) // height, radius
      .setSensor(true);
    
    this.world.createCollider(holeCollider, holeBody);
  }

  public async applyImpulse(x: number, z: number): Promise<void> {
    const RAPIER = await import('@dimforge/rapier3d');
    if (this.ballBody) {
      this.ballBody.applyImpulse(new RAPIER.Vector3(x, 0, z), true);
    }
  }

  public step(): void {
    this.world.step(this.eventQueue);
  }

  public getBallPosition(): { x: number; y: number; z: number } {
    if (!this.ballBody) return { x: 0, y: 0, z: 0 };
    const translation = this.ballBody.translation();
    return { x: translation.x, y: translation.y, z: translation.z };
  }

  public getBallVelocity(): { x: number; y: number; z: number } {
    if (!this.ballBody) return { x: 0, y: 0, z: 0 };
    const velocity = this.ballBody.linvel();
    return { x: velocity.x, y: velocity.y, z: velocity.z };
  }

  public isBallStopped(): boolean {
    const velocity = this.getBallVelocity();
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    return speed < 0.1;
  }
}
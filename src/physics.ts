export class PhysicsManager {
  public world!: any;
  public ballBody!: any;
  private RAPIER!: any;

  constructor() {
    // Physics world will be initialized when passed RAPIER
  }

  public async initialize(): Promise<void> {
    // Cache RAPIER module reference once during initialization
    this.RAPIER = await import('@dimforge/rapier3d');
    // Initialize physics world with gravity
    this.world = new this.RAPIER.World(new this.RAPIER.Vector3(0.0, -9.81, 0.0));
  }

  public async createBall(x: number, y: number, z: number): Promise<any> {
    const RAPIER = this.RAPIER;
    const ballDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    this.ballBody = this.world.createRigidBody(ballDesc);

    // Enable CCD to prevent tunneling through thin walls
    this.ballBody.setCcdEnabled(true);
    
    const ballCollider = RAPIER.ColliderDesc.ball(0.1) // Ball radius
      .setRestitution(0.4)
      .setFriction(0.8)
      .setDensity(1.0);
    
    this.world.createCollider(ballCollider, this.ballBody);
    return this.ballBody;
  }

  public async createGreen(width: number, length: number): Promise<void> {
    const RAPIER = this.RAPIER;
    const groundDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0.0, -0.05, 0.0);
    const groundBody = this.world.createRigidBody(groundDesc);
    
    const groundCollider = RAPIER.ColliderDesc.cuboid(width / 2, 0.05, length / 2)
      .setRestitution(0.2)
      .setFriction(0.9);
    
    this.world.createCollider(groundCollider, groundBody);
  }

  public async createWall(x: number, y: number, z: number, width: number, height: number, depth: number): Promise<void> {
    const RAPIER = this.RAPIER;
    const wallDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    const wallBody = this.world.createRigidBody(wallDesc);
    
    const wallCollider = RAPIER.ColliderDesc.cuboid(width / 2, height / 2, depth / 2)
      .setRestitution(0.6)
      .setFriction(0.8);
    
    this.world.createCollider(wallCollider, wallBody);
  }

  /**
   * Create a cylindrical obstacle collider to match the visual cylinder meshes.
   * @param x, y, z  centre position
   * @param radius   cylinder radius (matches visual scale)
   */
  public async createObstacle(x: number, y: number, z: number, radius: number): Promise<void> {
    const RAPIER = this.RAPIER;
    const obstacleDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
    const obstacleBody = this.world.createRigidBody(obstacleDesc);

    // Use cylinder collider (half-height 0.25 = half of 0.5 visual height)
    const obstacleCollider = RAPIER.ColliderDesc.cylinder(0.25, radius)
      .setRestitution(0.6)
      .setFriction(0.8);

    this.world.createCollider(obstacleCollider, obstacleBody);
  }

  public async applyImpulse(x: number, z: number): Promise<void> {
    const RAPIER = this.RAPIER;
    if (this.ballBody) {
      this.ballBody.applyImpulse(new RAPIER.Vector3(x, 0, z), true);
    }
  }

  public step(): void {
    // No EventQueue — hole detection uses distance-based check in game loop
    this.world.step();
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
    return speed < 0.01;
  }
}

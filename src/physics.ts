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
    const ballDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y, z)
      .setCcdEnabled(true)
      .setLinearDamping(1.5)    // Rolling resistance on grass
      .setAngularDamping(1.0);
    this.ballBody = this.world.createRigidBody(ballDesc);
    
    const ballCollider = RAPIER.ColliderDesc.ball(0.1) // Ball radius
      .setRestitution(0.4)
      .setFriction(0.8)
      .setDensity(1.0);
    
    this.world.createCollider(ballCollider, this.ballBody);
    return this.ballBody;
  }

  public async createGreen(width: number, length: number, holeX: number, holeZ: number, holeRadius: number): Promise<void> {
    const RAPIER = this.RAPIER;
    const surfaceY = -0.05;
    const halfH = 0.05;
    const hr = holeRadius + 0.02; // slightly larger gap than visual hole

    // Tile the green around the hole with 4 slabs
    // Slab layout (hole at holeX, holeZ):
    //  [  slab behind hole (far -Z side)  ]
    //  [left]  (hole gap)  [right]
    //  [  slab in front of hole (+Z side)  ]

    const halfW = width / 2;
    const halfL = length / 2;

    // Behind hole: from -halfL to holeZ - hr
    const behindLen = (holeZ - hr) - (-halfL);
    if (behindLen > 0) {
      const cz = (-halfL + (holeZ - hr)) / 2;
      this.createFixedCuboid(0, surfaceY, cz, halfW, halfH, behindLen / 2, 0.2, 0.9);
    }

    // In front of hole: from holeZ + hr to +halfL
    const frontLen = halfL - (holeZ + hr);
    if (frontLen > 0) {
      const cz = ((holeZ + hr) + halfL) / 2;
      this.createFixedCuboid(0, surfaceY, cz, halfW, halfH, frontLen / 2, 0.2, 0.9);
    }

    // Left of hole: in the hole's Z band, from -halfW to holeX - hr
    const leftWidth = (holeX - hr) - (-halfW);
    if (leftWidth > 0) {
      const cx = (-halfW + (holeX - hr)) / 2;
      const cz = holeZ;
      this.createFixedCuboid(cx, surfaceY, cz, leftWidth / 2, halfH, hr, 0.2, 0.9);
    }

    // Right of hole: in the hole's Z band, from holeX + hr to +halfW
    const rightWidth = halfW - (holeX + hr);
    if (rightWidth > 0) {
      const cx = ((holeX + hr) + halfW) / 2;
      const cz = holeZ;
      this.createFixedCuboid(cx, surfaceY, cz, rightWidth / 2, halfH, hr, 0.2, 0.9);
    }

    // Cup: cylindrical walls + floor below surface
    const cupDepth = 0.3;
    const cupFloorY = surfaceY - cupDepth;

    // Cup floor
    this.createFixedCuboid(holeX, cupFloorY, holeZ, holeRadius, 0.02, holeRadius, 0.2, 0.9);

    // Cup walls — use 8 thin cuboid slats arranged in a circle
    const slats = 12;
    const slatThickness = 0.02;
    for (let i = 0; i < slats; i++) {
      const angle = (i / slats) * Math.PI * 2;
      const sx = holeX + Math.cos(angle) * holeRadius;
      const sz = holeZ + Math.sin(angle) * holeRadius;
      const wallBody = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(sx, surfaceY - cupDepth / 2, sz)
      );
      const wallCollider = RAPIER.ColliderDesc.cuboid(slatThickness, cupDepth / 2, slatThickness)
        .setRestitution(0.1)
        .setFriction(0.5);
      this.world.createCollider(wallCollider, wallBody);
    }
  }

  private createFixedCuboid(x: number, y: number, z: number, halfW: number, halfH: number, halfD: number, restitution: number, friction: number): void {
    const RAPIER = this.RAPIER;
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
    const collider = RAPIER.ColliderDesc.cuboid(halfW, halfH, halfD)
      .setRestitution(restitution)
      .setFriction(friction);
    this.world.createCollider(collider, body);
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

  public async resetBall(x: number, y: number, z: number): Promise<void> {
    if (!this.ballBody) return;
    const RAPIER = this.RAPIER;
    this.ballBody.setTranslation(new RAPIER.Vector3(x, y, z), true);
    this.ballBody.setLinvel(new RAPIER.Vector3(0, 0, 0), true);
    this.ballBody.setAngvel(new RAPIER.Vector3(0, 0, 0), true);
  }

  public isBallStopped(): boolean {
    const velocity = this.getBallVelocity();
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    return speed < 0.01;
  }
}

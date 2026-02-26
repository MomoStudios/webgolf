import * as THREE from 'three';
import { SceneManager } from './scene';
import { PhysicsManager } from './physics';
import { Course } from './course';
import { ControlsManager } from './controls';
import { UIManager } from './ui';
import { GameState } from './types';

class Game {
  private sceneManager!: SceneManager;
  private physicsManager!: PhysicsManager;
  private course!: Course;
  private controlsManager!: ControlsManager;
  private uiManager!: UIManager;
  private gameState: GameState;
  private animationId: number = 0;

  constructor() {
    this.gameState = {
      strokes: 0,
      ballInHole: false,
      isDragging: false,
      gameComplete: false
    };

    this.init();
  }

  private async init(): Promise<void> {
    try {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      
      // Initialize managers
      this.sceneManager = new SceneManager(canvas);
      this.physicsManager = new PhysicsManager();
      await this.physicsManager.initialize();
      this.course = new Course(this.sceneManager.scene);
      this.uiManager = new UIManager();

      // Setup physics world to match visual course
      await this.setupPhysics();

      // Initialize controls — pass getBallPosition so aim line tracks the ball dynamically
      this.controlsManager = new ControlsManager(
        canvas,
        this.sceneManager.camera,
        this.sceneManager.scene,
        this.handlePutt.bind(this),
        () => this.course.getBallPosition()
      );

      // Show initial message
      this.uiManager.showMessage('Drag from the ball to aim and release to putt!', 4000);

      // Start game loop
      this.gameLoop();
    } catch (e) {
      console.error('Game init failed:', e);
      document.body.innerHTML = `<div style="color:white;padding:20px;font-family:sans-serif"><h1>Init Error</h1><pre>${e}</pre></div>`;
    }
  }

  private async setupPhysics(): Promise<void> {
    const W = 3;   // Course.WIDTH
    const L = 10;  // Course.LENGTH
    const T = 0.12;
    const H = 0.3;

    // Green
    await this.physicsManager.createGreen(W, L);

    // Walls (left, right, back, front)
    await this.physicsManager.createWall(-(W / 2 + T / 2), H / 2, 0, T, H, L + T * 2);
    await this.physicsManager.createWall((W / 2 + T / 2), H / 2, 0, T, H, L + T * 2);
    await this.physicsManager.createWall(0, H / 2, -(L / 2 + T / 2), W + T * 2, H, T);
    await this.physicsManager.createWall(0, H / 2, (L / 2 + T / 2), W + T * 2, H, T);

    // Bumpers
    await this.physicsManager.createObstacle(-0.6, H / 2, -1, 0.15);
    await this.physicsManager.createObstacle(0.6, H / 2, 0.5, 0.15);

    // Ball at tee
    await this.physicsManager.createBall(0, 0.15, 4);
  }

  private async handlePutt(power: number, direction: THREE.Vector2): Promise<void> {
    if (this.gameState.gameComplete || !this.physicsManager.isBallStopped()) {
      return;
    }

    // Convert 2D direction to 3D physics impulse
    const impulseStrength = power * 0.0125;
    const impulseX = direction.x * impulseStrength;
    const impulseZ = direction.y * impulseStrength;

    await this.physicsManager.applyImpulse(impulseX, impulseZ);
    
    this.gameState.strokes++;
    this.uiManager.updateStrokeCount(this.gameState.strokes);
  }

  private checkBallInHole(): void {
    const ballPos = this.physicsManager.getBallPosition();
    const holePos = this.course.getHolePosition();
    
    const distance = Math.sqrt(
      Math.pow(ballPos.x - holePos.x, 2) + 
      Math.pow(ballPos.z - holePos.z, 2)
    );

    // Check if ball is close enough to hole and moving slowly
    if (distance < 0.15 && this.physicsManager.isBallStopped() && !this.gameState.ballInHole) {
      this.gameState.ballInHole = true;
      this.gameState.gameComplete = true;
      
      const message = this.gameState.strokes === 1 
        ? 'Hole in One! 🎉' 
        : `Hole Complete! ${this.gameState.strokes} strokes`;
      
      this.uiManager.showMessage(message, 5000);
    }
  }

  private gameLoop(): void {
    // Physics step
    this.physicsManager.step();

    // Update ball visual position from physics
    const ballPos = this.physicsManager.getBallPosition();
    this.course.updateBallPosition(ballPos.x, ballPos.y, ballPos.z);

    // Check game conditions
    this.checkBallInHole();

    // Render
    this.sceneManager.render();

    // Continue loop
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Initialize game when page loads and store on window for debugging
window.addEventListener('load', () => {
  window.game = new Game();
});

// Expose game globally for debugging
declare global {
  interface Window {
    game: Game;
  }
}

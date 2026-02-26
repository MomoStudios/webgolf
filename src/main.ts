import * as THREE from 'three';
import { Renderer } from './core/renderer';
import { PhysicsManager } from './core/physics';
import { buildCourseVisuals } from './course/builder-visual';
import { buildCoursePhysics } from './course/builder-physics';
import { hole01 } from './course/hole-01';
import { BallController } from './gameplay/ball';
import { isBallInHole, isBallOutOfBounds } from './gameplay/hole-detection';
import { createStateMachine, GameStateKind, transition, canStartAim } from './gameplay/state-machine';
import { InputManager } from './controls/input';
import { AimLine } from './controls/aim';
import { HUD } from './ui/hud';

class Game {
  private renderer!: Renderer;
  private physics!: PhysicsManager;
  private ball!: BallController;
  private input!: InputManager;
  private aimLine!: AimLine;
  private hud!: HUD;
  private sm = createStateMachine();
  private animationId = 0;
  private lastTime = 0;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;

      this.renderer = new Renderer(canvas);
      this.physics = new PhysicsManager();
      await this.physics.initialize();

      // Build visual course
      const visuals = buildCourseVisuals(this.renderer.scene, hole01);

      // Build physics course
      buildCoursePhysics(this.physics.RAPIER, this.physics.world, hole01);

      // Create physics ball
      const ballBody = this.physics.createBall(hole01.tee.x, 0.15, hole01.tee.z);
      this.ball = new BallController(visuals.ball, ballBody, this.physics.RAPIER);

      this.hud = new HUD();
      this.aimLine = new AimLine(this.renderer.scene, 15);

      this.input = new InputManager(
        canvas,
        this.renderer.camera,
        () => this.sm.current,
        () => this.ball.getPosition(),
        (power, dir) => this.handlePutt(power, dir),
        () => transition(this.sm, GameStateKind.Aiming),
        () => {
          const pts = this.input.getAimWorldPoints();
          if (pts) this.aimLine.update(pts.start, pts.end, pts.power);
          else this.aimLine.hide();
        },
        () => {
          this.aimLine.hide();
          if (canStartAim(this.sm)) transition(this.sm, GameStateKind.Idle);
        },
      );

      this.hud.showMessage('Drag from the ball to aim and release to putt!', 4000);
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    } catch (e) {
      console.error('Game init failed:', e);
      document.body.innerHTML = `<div style="color:white;padding:20px;font-family:sans-serif"><h1>Init Error</h1><pre>${e}</pre></div>`;
    }
  }

  private handlePutt(power: number, direction: THREE.Vector2): void {
    if (this.sm.current !== GameStateKind.Aiming) return;

    const maxPower = 15;
    const normalizedPower = power / maxPower;
    const impulseStrength = 0.2 * (normalizedPower * normalizedPower) * maxPower;

    this.ball.applyImpulse(direction.x * impulseStrength, direction.y * impulseStrength);
    this.sm.strokes++;
    this.hud.updateStrokeCount(this.sm.strokes);
    transition(this.sm, GameStateKind.Rolling);
  }

  private gameLoop(now: number): void {
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));

    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.physics.step(dt);
    this.ball.syncVisual();

    this.updateGameState();
    this.renderer.render();
  }

  private updateGameState(): void {
    const state = this.sm.current;

    if (state === GameStateKind.Rolling) {
      // Force-stop if slow
      const stopped = this.ball.forceStopIfSlow(0.05);
      if (stopped) {
        transition(this.sm, GameStateKind.Idle);
      }

      // Hole detection
      if (isBallInHole(this.ball, hole01)) {
        transition(this.sm, GameStateKind.Scored);
        const msg = this.sm.strokes === 1
          ? 'Hole in One! 🎉'
          : `Hole Complete! ${this.sm.strokes} strokes`;
        this.hud.showMessage(msg, 3000);
        setTimeout(() => this.resetCourse(), 3000);
        return;
      }

      // Out of bounds — penalty stroke, reset ball to tee
      if (isBallOutOfBounds(this.ball)) {
        this.sm.strokes++;
        this.hud.updateStrokeCount(this.sm.strokes);
        this.hud.showMessage('Out of Bounds! +1 stroke', 2000);
        this.ball.reset(hole01.tee.x, 0.15, hole01.tee.z);
        transition(this.sm, GameStateKind.Idle);
        return;
      }
    }
  }

  private resetCourse(): void {
    this.sm.strokes = 0;
    transition(this.sm, GameStateKind.Idle);
    this.hud.updateStrokeCount(0);
    this.ball.reset(hole01.tee.x, 0.15, hole01.tee.z);
  }

  public destroy(): void {
    cancelAnimationFrame(this.animationId);
  }
}

window.addEventListener('load', () => {
  (window as unknown as Record<string, unknown>)['game'] = new Game();
});

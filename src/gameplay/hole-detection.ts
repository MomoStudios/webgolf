import type { BallController } from './ball';

/** Returns true if ball has fallen below the green surface (into the hole) */
export function isBallInHole(ball: BallController): boolean {
  return ball.getPosition().y < -0.05;
}

/** Returns true if ball is completely out of bounds */
export function isBallOutOfBounds(ball: BallController): boolean {
  return ball.getPosition().y < -2;
}

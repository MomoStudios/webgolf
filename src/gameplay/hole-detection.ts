import type { BallController } from './ball';
import type { HoleDef } from '../course/types';

/** Returns true if ball has fallen into the cup (below surface AND near the hole) */
export function isBallInHole(ball: BallController, holeDef: HoleDef): boolean {
  const pos = ball.getPosition();
  if (pos.y >= -0.05) return false;

  const dx = pos.x - holeDef.hole.x;
  const dz = pos.z - holeDef.hole.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  return dist < holeDef.holeRadius + 0.1;
}

/** Returns true if ball is completely out of bounds */
export function isBallOutOfBounds(ball: BallController): boolean {
  return ball.getPosition().y < -2;
}

import type { HoleDef } from './types';

export const hole01: HoleDef = {
  width: 3,
  length: 10,
  tee: { x: 0, z: 4 },
  hole: { x: 0, z: -4 },
  holeRadius: 0.18,
  walls: [
    // Left wall
    { x: -(3 / 2 + 0.12 / 2), z: 0, width: 0.12, depth: 10 + 0.12 * 2 },
    // Right wall
    { x: (3 / 2 + 0.12 / 2), z: 0, width: 0.12, depth: 10 + 0.12 * 2 },
    // Back wall (far -Z, near hole)
    { x: 0, z: -(10 / 2 + 0.12 / 2), width: 3 + 0.12 * 2, depth: 0.12 },
    // Front wall (tee end)
    { x: 0, z: (10 / 2 + 0.12 / 2), width: 3 + 0.12 * 2, depth: 0.12 },
  ],
  bumpers: [
    { x: -0.6, z: -1, radius: 0.15 },
    { x: 0.6, z: 0.5, radius: 0.15 },
  ],
};

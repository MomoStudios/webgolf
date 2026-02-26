// Shared types for the webgolf game.
// GameState is now handled by gameplay/state-machine.ts
// Course types are in course/types.ts

import * as THREE from 'three';

export interface Controls {
  isDragging: boolean;
  dragStart: THREE.Vector2;
  dragCurrent: THREE.Vector2;
  maxPower: number;
}

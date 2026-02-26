import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d';

export interface GameState {
  strokes: number;
  ballInHole: boolean;
  isDragging: boolean;
  gameComplete: boolean;
}

export interface Controls {
  isDragging: boolean;
  dragStart: THREE.Vector2;
  dragCurrent: THREE.Vector2;
  maxPower: number;
}

export interface PhysicsWorld {
  world: RAPIER.World;
  ballBody: RAPIER.RigidBody;
  eventQueue: RAPIER.EventQueue;
}

export interface GameObjects {
  ball: THREE.Mesh;
  green: THREE.Mesh;
  walls: THREE.Mesh[];
  hole: THREE.Mesh;
  aimLine?: THREE.Line;
}
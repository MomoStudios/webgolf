import type RAPIER_TYPE from '@dimforge/rapier3d';
import type { HoleDef } from './types';

type RapierModule = typeof RAPIER_TYPE;

export function buildCoursePhysics(RAPIER: RapierModule, world: RAPIER_TYPE.World, def: HoleDef): void {
  const WALL_H = 0.3;
  const T = 0.12;

  // Green slabs with hole cut-out
  const surfaceY = -0.05;
  const halfH = 0.05;
  const hr = def.holeRadius + 0.02;
  const halfW = def.width / 2;
  const halfL = def.length / 2;
  const hx = def.hole.x;
  const hz = def.hole.z;

  // Behind hole: from -halfL to hz - hr
  const behindLen = (hz - hr) - (-halfL);
  if (behindLen > 0) {
    createFixedCuboid(RAPIER, world, 0, surfaceY, (-halfL + (hz - hr)) / 2, halfW, halfH, behindLen / 2, 0.2, 0.9);
  }

  // In front of hole: from hz + hr to +halfL
  const frontLen = halfL - (hz + hr);
  if (frontLen > 0) {
    createFixedCuboid(RAPIER, world, 0, surfaceY, ((hz + hr) + halfL) / 2, halfW, halfH, frontLen / 2, 0.2, 0.9);
  }

  // Left of hole band
  const leftWidth = (hx - hr) - (-halfW);
  if (leftWidth > 0) {
    createFixedCuboid(RAPIER, world, (-halfW + (hx - hr)) / 2, surfaceY, hz, leftWidth / 2, halfH, hr, 0.2, 0.9);
  }

  // Right of hole band
  const rightWidth = halfW - (hx + hr);
  if (rightWidth > 0) {
    createFixedCuboid(RAPIER, world, ((hx + hr) + halfW) / 2, surfaceY, hz, rightWidth / 2, halfH, hr, 0.2, 0.9);
  }

  // Cup floor + walls
  const cupDepth = 0.3;
  const cupFloorY = surfaceY - cupDepth;
  createFixedCuboid(RAPIER, world, hx, cupFloorY, hz, def.holeRadius, 0.02, def.holeRadius, 0.2, 0.9);

  const slats = 12;
  const slatThickness = 0.02;
  for (let i = 0; i < slats; i++) {
    const angle = (i / slats) * Math.PI * 2;
    const sx = hx + Math.cos(angle) * def.holeRadius;
    const sz = hz + Math.sin(angle) * def.holeRadius;
    const wallBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.fixed().setTranslation(sx, surfaceY - cupDepth / 2, sz)
    );
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(slatThickness, cupDepth / 2, slatThickness)
        .setRestitution(0.1)
        .setFriction(0.5),
      wallBody
    );
  }

  // Walls
  for (const w of def.walls) {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(w.x, WALL_H / 2, w.z));
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(w.width / 2, WALL_H / 2, w.depth / 2)
        .setRestitution(0.6)
        .setFriction(0.8),
      body
    );
  }

  // Bumpers
  for (const b of def.bumpers) {
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(b.x, WALL_H / 2, b.z));
    world.createCollider(
      RAPIER.ColliderDesc.cylinder(0.25, b.radius)
        .setRestitution(0.6)
        .setFriction(0.8),
      body
    );
  }

  void T;
}

function createFixedCuboid(
  RAPIER: RapierModule,
  world: RAPIER_TYPE.World,
  x: number, y: number, z: number,
  halfW: number, halfH: number, halfD: number,
  restitution: number, friction: number
): void {
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  world.createCollider(
    RAPIER.ColliderDesc.cuboid(halfW, halfH, halfD)
      .setRestitution(restitution)
      .setFriction(friction),
    body
  );
}

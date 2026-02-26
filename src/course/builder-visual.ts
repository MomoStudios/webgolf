import * as THREE from 'three';
import type { HoleDef } from './types';

export interface CourseVisuals {
  ball: THREE.Mesh;
  hole: THREE.Mesh;
}

export function buildCourseVisuals(scene: THREE.Scene, def: HoleDef): CourseVisuals {
  const WALL_H = 0.3;
  const WALL_T = 0.12;

  // Green — flat plane with circular hole cut out
  const greenShape = new THREE.Shape();
  const hw = def.width / 2;
  const hl = def.length / 2;
  // Outer rectangle (in XZ mapped to shape's XY)
  greenShape.moveTo(-hw, -hl);
  greenShape.lineTo(hw, -hl);
  greenShape.lineTo(hw, hl);
  greenShape.lineTo(-hw, hl);
  greenShape.lineTo(-hw, -hl);

  // Circular hole cut-out
  const holePath = new THREE.Path();
  const holeSegs = 24;
  const cr = def.holeRadius + 0.02; // slightly larger than physics gap
  for (let i = 0; i <= holeSegs; i++) {
    const a = (i / holeSegs) * Math.PI * 2;
    const px = def.hole.x + Math.cos(a) * cr;
    const pz = def.hole.z + Math.sin(a) * cr;
    if (i === 0) holePath.moveTo(px, pz);
    else holePath.lineTo(px, pz);
  }
  greenShape.holes.push(holePath);

  const greenGeo = new THREE.ShapeGeometry(greenShape, 1);
  // ShapeGeometry lies in XY — rotate to XZ
  greenGeo.rotateX(-Math.PI / 2);
  const greenMat = new THREE.MeshLambertMaterial({ color: 0x4caf50, flatShading: true });
  const green = new THREE.Mesh(greenGeo, greenMat);
  green.position.y = 0.05; // surface level
  green.receiveShadow = true;
  scene.add(green);

  // Walls
  const wallMat = new THREE.MeshLambertMaterial({ color: 0x8d6e63, flatShading: true });
  for (const w of def.walls) {
    const geo = new THREE.BoxGeometry(w.width, WALL_H, w.depth);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(w.x, WALL_H / 2, w.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }

  // Bumpers
  const bumperMat = new THREE.MeshLambertMaterial({ color: 0xf44336, flatShading: true });
  for (const b of def.bumpers) {
    const geo = new THREE.CylinderGeometry(b.radius, b.radius, WALL_H, 8);
    const mesh = new THREE.Mesh(geo, bumperMat);
    mesh.position.set(b.x, WALL_H / 2, b.z);
    mesh.castShadow = true;
    scene.add(mesh);
  }

  // Hole visuals
  const cupDepth = 0.3;
  const cupRadius = def.holeRadius;
  const hx = def.hole.x;
  const hz = def.hole.z;

  // Cup interior
  const cupGeo = new THREE.CylinderGeometry(cupRadius, cupRadius, cupDepth, 16, 1, true);
  const cupMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, side: THREE.BackSide });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.position.set(hx, -cupDepth / 2 + 0.05, hz);
  scene.add(cup);

  // Cup floor
  const floorGeo = new THREE.CircleGeometry(cupRadius, 16);
  const floorMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(hx, 0.05 - cupDepth, hz);
  scene.add(floor);

  // Rim ring
  const rimGeo = new THREE.TorusGeometry(cupRadius, 0.02, 8, 24);
  const rimMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(hx, 0.06, hz);
  scene.add(rim);

  // Flag pole
  const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(hx + 0.15, 0.6, hz);
  pole.castShadow = true;
  scene.add(pole);

  // Flag
  const flagGeo = new THREE.BufferGeometry();
  const verts = new Float32Array([0, 0, 0, 0.4, -0.1, 0, 0, -0.25, 0]);
  flagGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  flagGeo.computeVertexNormals();
  const flagMat = new THREE.MeshLambertMaterial({ color: 0xff5722, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(hx + 0.15, 1.2, hz);
  scene.add(flag);

  // Tee marker
  const teeGeo = new THREE.BoxGeometry(1.2, 0.02, 0.8);
  const teeMat = new THREE.MeshLambertMaterial({ color: 0x66bb6a });
  const tee = new THREE.Mesh(teeGeo, teeMat);
  tee.position.set(def.tee.x, 0.06, def.tee.z);
  scene.add(tee);

  // Surrounding ground
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x3e8e41 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  // Ball mesh
  const ballGeo = new THREE.SphereGeometry(0.1, 16, 12);
  const ballMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const ball = new THREE.Mesh(ballGeo, ballMat);
  ball.position.set(def.tee.x, 0.15, def.tee.z);
  ball.castShadow = true;
  scene.add(ball);

  // Invisible hole marker
  const holeMesh = new THREE.Mesh();
  holeMesh.position.set(hx, 0.05, hz);

  // Suppress unused WALL_T warning
  void WALL_T;

  return { ball, hole: holeMesh };
}

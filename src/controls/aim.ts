import * as THREE from 'three';

const SEGMENTS = 10;

export class AimLine {
  private line: THREE.Line;
  private posAttr: THREE.BufferAttribute;
  private readonly maxPower: number;

  constructor(scene: THREE.Scene, maxPower: number) {
    this.maxPower = maxPower;

    // Pre-allocate buffer for SEGMENTS+1 points
    const positions = new Float32Array((SEGMENTS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    const attr = new THREE.BufferAttribute(positions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', attr);
    this.posAttr = attr;

    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 });
    // Use a single color attribute for power-based color
    const colors = new Float32Array((SEGMENTS + 1) * 3);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.line = new THREE.Line(geo, mat);
    this.line.visible = false;
    this.line.frustumCulled = false;
    scene.add(this.line);
  }

  public update(start: THREE.Vector3, end: THREE.Vector3, power: number): void {
    const positions = this.posAttr.array as Float32Array;
    const colorAttr = this.line.geometry.attributes['color'] as THREE.BufferAttribute;
    const colors = colorAttr.array as Float32Array;
    const powerRatio = power / this.maxPower;
    const color = new THREE.Color().setHSL((1 - powerRatio) * 0.3, 0.8, 0.6);

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const px = start.x + (end.x - start.x) * t;
      const py = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * 0.1;
      const pz = start.z + (end.z - start.z) * t;
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    this.line.visible = true;
  }

  public hide(): void {
    this.line.visible = false;
  }
}

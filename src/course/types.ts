export interface WallDef {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface BumperDef {
  x: number;
  z: number;
  radius: number;
}

export interface HoleDef {
  width: number;
  length: number;
  tee: { x: number; z: number };
  hole: { x: number; z: number };
  holeRadius: number;
  walls: WallDef[];
  bumpers: BumperDef[];
}

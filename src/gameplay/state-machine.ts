export enum GameStateKind {
  Idle = 'Idle',
  Aiming = 'Aiming',
  Rolling = 'Rolling',
  Scored = 'Scored',
}

export interface GameStateMachine {
  current: GameStateKind;
  strokes: number;
}

export function createStateMachine(): GameStateMachine {
  return { current: GameStateKind.Idle, strokes: 0 };
}

export function canStartAim(sm: GameStateMachine): boolean {
  return sm.current === GameStateKind.Idle;
}

export function canPutt(sm: GameStateMachine): boolean {
  return sm.current === GameStateKind.Aiming;
}

export function transition(sm: GameStateMachine, next: GameStateKind): void {
  sm.current = next;
}

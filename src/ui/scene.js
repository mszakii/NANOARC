// Qamar Square moon-base scene. Owner: Lane B.
// CONTRACT STUB — implement exactly as specified in specs/plan.md §5.4.

export const DEVICE_FOR_STEP = {
  greenhouse: 'greenhouse',
  valve: 'valve',
  shelter: 'shelter',
  oxygen: 'oxygen',
  repair: 'recycler',
  plastic: 'printer',
  signal: 'antenna',
  antenna: 'antenna',
};

/**
 * Build the SVG base and its hotspot buttons inside `root`. Call once.
 * @param {HTMLElement} root
 * @param {{ onDevice: (id: string) => void }} handlers
 */
export function mountScene(root, { onDevice }) {
  root.textContent = 'Moon base scene (Lane B, T2)';
}

/**
 * Reflect the game state in the scene. `state` may be null on the start and loadout screens.
 * @param {object|null} state
 * @param {{ screen: string, selected: string|null, bagStage: 0|1|2, seq: number|null }} view
 */
export function updateScene(state, view) {}

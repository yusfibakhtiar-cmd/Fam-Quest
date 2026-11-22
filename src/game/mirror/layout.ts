/** Fixed layout (world units, land centred on origin). P8: nothing is placed by playing. */
export const LAYOUT = {
  house: [0, -4] as const,
  /** Parent trees, in member order. Two is the common case; up to four fit. */
  trees: [[-9, -4], [9, -4], [-9, 4.5], [9, 4.5]] as const,
  garden: [0, 4.5] as const,
};

export const COLORS = {
  wall: "#f3eee4",
  roof: "#2f6b57",
  wood: "#7a5a3c",
  gold: "#e2b34a",
  windowLit: "#ffd27a",
  windowDark: "#5d7f8f",
  lantern: "#ffc861",
  soil: "#9b7a55",
  leaves: ["#3f8a5c", "#55a06a", "#4f9a6e", "#62a874"],
};

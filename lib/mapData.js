// Map Legend:
// 0 = Empty Floor
// 1 = Solid Wall
// 2 = Locked Door
// 3 = Elevator/Stairs
// 4 = Computer Terminal
// 5 = Keycard Pickup

export const FLOORS = {
    0: {
      name: "Ground Floor - Lobby & Corridor",
      spawn: [1.5, 1, 1.5],
      grid: [
        [1, 1, 1, 1, 1],
        [1, 3, 0, 0, 1],
        [1, 1, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 1, 1, 1],
        [1, 0, 0, 5, 1],
        [1, 1, 1, 1, 1],
      ],
    },
    1: {
      name: "Floor 1 - Main Office & Lounge",
      spawn: [1.5, 1, 1.5],
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 3, 0, 2, 0, 0, 4, 0, 1],
        [1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 0, 4, 0, 2, 0, 2, 0, 1],
        [1, 0, 0, 0, 1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
    2: {
      name: "Floor 2 - Executive & Server Rooms",
      spawn: [1.5, 1, 1.5],
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 3, 1, 0, 0, 1, 4, 0, 1],
        [1, 0, 2, 0, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 2, 0, 1],
        [1, 4, 1, 1, 2, 1, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
  };
// Color distance helper to snap slightly off colors to our exact palette
const colorDist = (r1, g1, b1, r2, g2, b2) => Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);

const PALETTE = [
  { r: 0,   g: 0,   b: 0,   type: 1 },    // Black: Solid Wall
  { r: 255, g: 255, b: 255, type: 0 },    // White: Walkable Floor
  { r: 255, g: 0,   b: 136, type: -1 },   // Neon Pink: SPAWN POINT
  
  { r: 0,   g: 255, b: 0,   type: 4 },    // Bright Green: Terminal
  { r: 255, g: 165, b: 0,   type: 6 },    // Orange: Ceiling Light
  { r: 0,   g: 255, b: 255, type: 3 },    // Cyan: Elevator
  
  { r: 255, g: 0,   b: 0,   type: 2 },    // Bright Red: Red Door
  { r: 139, g: 0,   b: 0,   type: 5 },    // Dark Red: Red Keycard
  
  { r: 0,   g: 0,   b: 255, type: 12 },   // Bright Blue: Blue Door
  { r: 0,   g: 0,   b: 139, type: 15 },   // Dark Blue: Blue Keycard
  
  { r: 255, g: 255, b: 0,   type: 22 },   // Bright Yellow: Yellow Door
  { r: 184, g: 134, b: 11,  type: 25 },   // Dark Yellow (Goldenrod): Yellow Keycard
  
  { r: 128, g: 128, b: 128, type: 7 },    // Gray Door: Terminal opens this door
  { r: 128, g: 0,   b: 128, type: 9 },     // Purple: Elevation DOWN (Hole/Ramp)

  { r: 211, g: 211, b: 211, type: 32 },   // Light Gray: Manual Door
];

const getClosestTile = (r, g, b) => {
  let closest = PALETTE[0];
  let minD = Infinity;
  for (const color of PALETTE) {
    const d = colorDist(r, g, b, color.r, color.g, color.b);
    if (d < minD) {
      minD = d;
      closest = color;
    }
  }
  return closest.type;
};

export const loadMapFromImage = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, img.width, img.height).data;
      const grid = [];
      let spawnPoint = null;

      for (let z = 0; z < img.height; z++) {
        const row = [];
        for (let x = 0; x < img.width; x++) {
          const i = (z * img.width + x) * 4;
          const r = imgData[i];
          const g = imgData[i+1];
          const b = imgData[i+2];
          
          let tileType = getClosestTile(r, g, b);
          
          // Check if this pixel is the designated spawn point (-1)
          if (tileType === -1) {
            spawnPoint = [x + 0.5, 0.8, z + 0.5];
            tileType = 0; // Replace the pink pixel with a walkable floor
          }
          
          row.push(tileType);
        }
        grid.push(row);
      }
      
      resolve({ grid, spawnPoint, width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
};
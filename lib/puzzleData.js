export const RIDDLE_BANK = [
  { title: "SECURITY CHECK", question: "I have cities but no houses. I have mountains but no trees. I have water but no fish. What am I?", answer: "map" },
  { title: "LOGIC GATE", question: "What gets wetter the more it dries?", answer: "towel" },
  { title: "VOICE PRINT", question: "I speak without a mouth and hear without ears. I come alive with wind. What am I?", answer: "echo" },
  { title: "ENCRYPTION A", question: "The more of this there is, the less you see. What is it?", answer: "darkness" },
  { title: "ENCRYPTION B", question: "I shave every day, but my beard stays the same. What am I?", answer: "barber" },
  { title: "DATA RECOVERY", question: "What has keys but can't open locks?", answer: "piano" },
  { title: "SYSTEM ERROR", question: "I belong to you, but everyone else uses me more. What am I?", answer: "name" },
  { title: "AI CALIBRATION", question: "What has a head, a tail, is brown, and has no legs?", answer: "penny" },
  { title: "FIREWALL TEST", question: "If you drop me I'm sure to crack, but give me a smile and I'll always smile back.", answer: "mirror" },
  { title: "OVERRIDE", question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "m" }
];

export const TERMINAL_DIRECTORY = {
  // --- THESE PULL FROM THE RANDOM RIDDLE BANK ---
  "0_14_135": { 
    type: "random-riddle", 
    successMessage: "Correct. Sector A Door Unlocked.", 
    reward: { fIdx: 0, x: 14, z: 136, newTile: 17 } 
  },
  "0_20_100": { 
    type: "random-riddle", 
    successMessage: "Correct. Dispensing Blue Keycard.", 
    reward: { fIdx: 0, x: 20, z: 101, newTile: 15 } 
  },
  "0_60_7": {
    type: "random-riddle",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 0 }
  },
  "0_21_21": {
    type: "random-riddle",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 0 }
  },
  
  // 🚨 NEW: The Lights Out Mini-Game Terminal
  "0_20_100": { // Replace with the actual coordinates on your map
    type: "lights-out",
    title: "MAINFRAME BYPASS",
    question: "ALIGN ALL SECURITY NODES TO PROCEED.",
    gridSize: 3, 
    initialGrid: [
      1, 0, 1,
      0, 1, 0,
      1, 0, 1
    ],
    successMessage: "BYPASS SUCCESSFUL. ACCESS GRANTED.",
    reward: { fIdx: 0, x: 20, z: 101, newTile: 15 } // Spawns a Blue Keycard
  }
};

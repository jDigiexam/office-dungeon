export const TERMINAL_PUZZLES = {
    // Replace the coordinates (e.g., "0_14_10") with the actual X/Z coordinates of the terminals on your map.
    
    "0_3_3": {
      type: "multiple-choice",
      title: "SECURITY PROTOCOL 1A",
      question: "Which of the following is NOT a core value of our team?",
      options: ["Transparency", "Innovation", "Silos", "Collaboration"],
      answer: "Silos",
      successMessage: "Correct. Main vault door unlocked.",
      // Action: Change the tile at X:14, Z:9 from a Locked Door (2) to an Open Door (8)
      reward: { fIdx: 0, x: 3, z: 4, newTile: 8 } 
    },
    
    "0_22_8": {
      type: "text-input",
      title: "MAINTENANCE OVERRIDE",
      question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
      answer: "0451", // Classic immersive sim door code!
      successMessage: "Code accepted. Dispensing Blue Keycard.",
      // Action: Spawn a Blue Keycard (15) on the floor next to the terminal
      reward: { fIdx: 0, x: 22, z: 9, newTile: 15 }
    },
  
    "0_5_15": {
      type: "riddle",
      title: "SYSTEM LOCKOUT",
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      answer: "echo", 
      successMessage: "Voice recognition matched. Access granted.",
      // Action: Change a Solid Wall (1) to a Walkable Floor (0) to reveal a hidden area
      reward: { fIdx: 0, x: 5, z: 14, newTile: 0 }
    },
  
    "0_30_30": {
      type: "text-input",
      title: "DATABASE ENCRYPTION",
      question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
      answer: "3", // The answer is the number of letters in the spelled-out word
      successMessage: "Encryption bypassed. Secondary pathways opened.",
      reward: { fIdx: 0, x: 31, z: 30, newTile: 8 }
    }
  };
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
  // Update these keys with the 5 actual X_Z coordinates from your map!
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
  // Add all other terminal entries here...
};
export const TERMINAL_PUZZLES = {
  "0_3_3": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Give me food and I will grow. Give me drink and watch me die. What am I?",
    options: ["Ice", "Fire", "Bacteria", "Ideas"],
    answer: "Fire",
    successMessage: "Correct. Door unlocked.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 17 }
  },

  "0_16_3": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 15 }
  },

  "0_60_7": {
    type: "riddle",
    title: "SECURITY PROTOCOL 1B",
    question: "What is so fragile that when you speak of it, it breaks?",
    answer: "Silence",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 0 }
  },

  "0_53_12": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 8 }
  },

  "0_3_15": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 17 }
  },

  "0_57_15": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 15 }
  },

  "0_21_21": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 19, newTile: 0 }
  },

  "0_3_27": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 14, z: 31, newTile: 8 }
  },

  "0_57_27": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 31, newTile: 17 }
  },

  "0_3_39": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 43, newTile: 15 }
  },

  "0_57_39": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 43, newTile: 0 }
  },

  "0_3_51": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 14, z: 55, newTile: 8 }
  },

  "0_57_51": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 55, newTile: 17 }
  },

  "0_48_58": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 55, newTile: 15 }
  },

  "0_21_62": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 67, newTile: 0 }
  },

  "0_3_63": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 14, z: 67, newTile: 8 }
  },

  "0_57_63": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 67, newTile: 17 }
  },

  "0_3_75": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 15 }
  },

  "0_57_75": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 0 }
  },

  "0_3_87": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 8 }
  },

  "0_57_87": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 55, z: 127, newTile: 17 }
  },

  "0_33_92": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 15 }
  },

  "0_37_92": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 0 }
  },

  "0_33_96": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 8 }
  },

  "0_37_96": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 17 }
  },

  "0_3_99": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 14, z: 79, newTile: 15 }
  },

  "0_57_99": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 55, z: 127, newTile: 0 }
  },

  "0_57_111": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 55, z: 127, newTile: 8 }
  },

  "0_7_116": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 136, newTile: 17 }
  },

  "0_48_118": {
    type: "text-input",
    title: "MAINTENANCE OVERRIDE",
    question: "Enter the 4-digit code written on the whiteboard in the breakroom.",
    answer: "0451",
    successMessage: "Code accepted. Dispensing Blue Keycard.",
    reward: { fIdx: 0, x: 55, z: 127, newTile: 15 }
  },

  "0_57_123": {
    type: "riddle",
    title: "SYSTEM LOCKOUT",
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "echo",
    successMessage: "Voice recognition matched. Access granted.",
    reward: { fIdx: 0, x: 55, z: 127, newTile: 0 }
  },

  "0_54_128": {
    type: "text-input",
    title: "DATABASE ENCRYPTION",
    question: "If 1=3, 2=3, 3=5, 4=4, and 5=4, what does 6 equal?",
    answer: "3",
    successMessage: "Encryption bypassed. Secondary pathways opened.",
    reward: { fIdx: 0, x: 55, z: 127, newTile: 8 }
  },

  "0_13_135": {
    type: "multiple-choice",
    title: "SECURITY PROTOCOL 1A",
    question: "Which of the following is NOT a core value of our team?",
    options: ["Transparency", "Innovation", "Silos", "Collaboration"],
    answer: "Silos",
    successMessage: "Correct. Main vault door unlocked.",
    reward: { fIdx: 0, x: 14, z: 136, newTile: 17 }
  }
};

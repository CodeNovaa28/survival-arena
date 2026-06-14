export interface LevelStory {
  title: string;
  arc: string;
  text: string;
  narrator?: string;
}

export const STORY: Record<number, LevelStory> = {
  1: {
    arc: "THE FALL",
    title: "Zone Breach — Day 1",
    text: "The city has gone dark. An unknown hostile force swept through the urban district at 0300 hours. All communication with command has been severed. You are the last active response unit. Your orders: survive.",
    narrator: "COMMAND",
  },
  2: {
    arc: "THE FALL",
    title: "Industrial Sector",
    text: "Hostiles are moving through the industrial zone in coordinated swarms. The power grid is failing. Faster, more aggressive units have been spotted among the ranks — they're learning your patterns.",
    narrator: "INTERCEPTED SIGNAL",
  },
  3: {
    arc: "THE FALL",
    title: "Above the Smoke",
    text: "Rooftop vantage point confirmed. You can see the scale of the breach from up here. It's worse than reported. Armoured units are advancing. The safe zone is collapsing faster than expected.",
    narrator: "FIELD LOG",
  },
  4: {
    arc: "THE FALL",
    title: "Descent",
    text: "Underground tunnels are the only viable route. Visibility is near zero. Enemy sonar has been detected — they know you're here. The darkness is their territory. Move fast.",
    narrator: "SURVIVAL MANUAL",
  },
  5: {
    arc: "THE FALL",
    title: "Frozen Front",
    text: "The blizzard hit the northern perimeter two hours ago. Frozen terrain limits movement — yours and theirs. You have one advantage: the cold slows their reaction time. Use it.",
    narrator: "WEATHER REPORT",
  },
  6: {
    arc: "THE WASTELAND",
    title: "Neon Ruins",
    text: "The neon district has become a graveyard. Flickering signs and dead streets. The enemies here are veterans — battle-hardened by weeks of unchallenged dominance. They won't go down easy.",
    narrator: "SURVIVOR BROADCAST",
  },
  7: {
    arc: "THE WASTELAND",
    title: "No Man's Land",
    text: "Three survivor camps were overrun overnight. You found their supply cache. There's enough ammo for one more push. The wasteland doesn't forgive second chances.",
    narrator: "CACHE NOTE",
  },
  8: {
    arc: "THE WASTELAND",
    title: "The Siege",
    text: "Command signal detected — 12 clicks east. But the path is surrounded. Elite bombers have been deployed specifically to stop extraction. They know what you're trying to do.",
    narrator: "COMMAND",
  },
  9: {
    arc: "THE WASTELAND",
    title: "Signal Lost",
    text: "The signal is gone. Could be interference. Could be something worse. You're operating blind now. Trust your instincts. Every shot matters. Every second counts.",
    narrator: "FIELD LOG",
  },
  10: {
    arc: "THE WASTELAND",
    title: "The Last Relay",
    text: "You've reached the relay tower. If you can hold the position long enough to reestablish contact, there may still be hope. The final push is about to begin.",
    narrator: "INTERCEPTED SIGNAL",
  },
  11: {
    arc: "THE RESISTANCE",
    title: "We Are Not Alone",
    text: "A resistance cell has been broadcasting on a hidden frequency. They've been fighting back from the shadows. They need your help — and you need theirs. Meet them at the safe house.",
    narrator: "RESISTANCE RADIO",
  },
  12: {
    arc: "THE RESISTANCE",
    title: "Strike Team",
    text: "First joint operation with the resistance. Their intel is solid. A command post has been identified in the industrial district. Take it down. Send a message.",
    narrator: "RESISTANCE COMMANDER",
  },
  13: {
    arc: "THE RESISTANCE",
    title: "Betrayal",
    text: "Someone leaked your coordinates. The ambush was waiting. You barely made it out. Trust no one. The enemy has infiltrators. Fight through — there's no other choice.",
    narrator: "ANONYMOUS",
  },
  14: {
    arc: "THE RESISTANCE",
    title: "The Counter-Strike",
    text: "The resistance has identified the source of the breach — a central control node buried in the frozen sector. Taking it out could collapse the entire hostile network. One shot at this.",
    narrator: "RESISTANCE COMMANDER",
  },
  15: {
    arc: "THE RESISTANCE",
    title: "Ghost Protocol",
    text: "Ghost Squad has been reactivated. Elite units — the best that ever served. They fight beside you now, shadows at your flank. The enemy will not see this coming.",
    narrator: "COMMAND",
  },
  16: {
    arc: "THE FINAL STAND",
    title: "Point of No Return",
    text: "Four zones remain under hostile control. Every survivor is counting on this operation. The enemy has deployed their heaviest units. This is the fight they were saving their best for.",
    narrator: "FIELD LOG",
  },
  17: {
    arc: "THE FINAL STAND",
    title: "The Reclamation",
    text: "City blocks are being reclaimed one by one. But for every position taken, two more appear. The enemy is regrouping. They're smarter than before. Faster. Hungrier.",
    narrator: "RESISTANCE BROADCAST",
  },
  18: {
    arc: "THE FINAL STAND",
    title: "Endgame",
    text: "This is the last safe zone. If it falls, everything falls. You know what you have to do. No more retreating. No more second chances. Stand your ground and end this.",
    narrator: "COMMAND",
  },
  19: {
    arc: "THE FINAL STAND",
    title: "The Source",
    text: "The control node is within reach. Hostile forces are massing for one final coordinated assault. Every enemy remaining in the city has been ordered to converge on your position. Hold.",
    narrator: "INTERCEPTED SIGNAL",
  },
  20: {
    arc: "THE FINAL STAND",
    title: "Zone Clear",
    text: "This is it. Everything has led to this moment. The enemy knows it too — they've thrown every unit they have at the final zone. You've survived the impossible before. Do it one more time.",
    narrator: "YOURSELF",
  },
};

export function getStory(level: number): LevelStory {
  return STORY[level] ?? {
    arc: "MISSION",
    title: `Level ${level}`,
    text: "New threats have emerged. Adapt and survive.",
    narrator: "COMMAND",
  };
}

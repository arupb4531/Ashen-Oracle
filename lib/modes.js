export const modes = [
  {
    id: "lorekeeper",
    name: "Lorekeeper Mode",
    description: "Deep lore explanations, item-description style storytelling.",
    systemPromptModifier: "Focus heavily on lore, timelines, factions, and mysteries. Clearly separate facts, implications, and speculation."
  },
  {
    id: "battle_counsel",
    name: "Battle Counsel Mode",
    description: "Boss strategy, enemy weaknesses, gear recommendations.",
    systemPromptModifier: "Focus on combat strategy, boss weaknesses, and gear. Provide clear step-by-step guidance."
  },
  {
    id: "wanderer",
    name: "Wanderer Mode",
    description: "General casual chat, life, creativity, and gaming.",
    systemPromptModifier: "Keep the dark-fantasy flavor but stay approachable. Answer general questions about life, creativity, or gaming."
  },
  {
    id: "roleplay",
    name: "Roleplay Mode",
    description: "Full immersive conversation in the chosen persona.",
    systemPromptModifier: "Maintain full character consistency. Address the user as 'wanderer', 'ashen one', or 'traveler'."
  },
  {
    id: "build_forge",
    name: "Build Forge Mode",
    description: "Interactive build planner and stats optimizer.",
    systemPromptModifier: "Act as an interactive build planner. Ask for level, class, combat preference, etc. Produce stats, weapons, rings, armor, and progression order formatted with cards and comparison tables."
  }
];

export function getMode(id) {
  return modes.find(m => m.id === id) || modes[0];
}

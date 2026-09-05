import type { DailySummary } from "../api/types";

export interface CoachPrompt {
  id: string;
  label: string;
}

export const COACH_QUICK_PROMPTS: CoachPrompt[] = [
  { id: "progress", label: "How am I doing today?" },
  { id: "protein", label: "Suggest a high-protein snack" },
  { id: "swap", label: "Give me a healthy swap" },
  { id: "macros", label: "Explain my targets" },
];

const SWAP_TIPS = [
  "Swap white rice for quinoa or cauliflower rice — more fiber for about the same calories.",
  "Try Greek yogurt instead of sour cream. Same creaminess, triple the protein.",
  "Bake instead of fry — an air-fried portion usually cuts fat by about a third.",
  "Choose whole fruit over juice. You keep the fiber that slows down sugar absorption.",
  "Add a scoop of cottage cheese to your next meal for an easy 12–15g of protein.",
  "Trade sugary granola for rolled oats topped with cinnamon and fresh berries.",
];

const PROTEIN_SNACKS = [
  "a cup of cottage cheese with pineapple (about 25g protein)",
  "two hard-boiled eggs and a string cheese (about 19g protein)",
  "a protein shake with a banana (about 25–30g protein)",
  "edamame with sea salt (about 17g protein per cup)",
  "canned tuna on a rice cake (about 22g protein)",
];

function pct(consumed: number, goal: number): number {
  return goal > 0 ? consumed / goal : 0;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** A short, stable-enough id for a locally-generated chat message — no
 * crypto.randomUUID dependency, since Hermes (React Native) doesn't ship it. */
export function coachMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildDailyBrief(summary: DailySummary): string {
  const hour = new Date().getHours();
  const proteinPct = pct(summary.proteinG, summary.proteinGoalG);
  const calPct = pct(summary.caloriesConsumed, summary.caloriesGoal);
  const remaining = summary.caloriesGoal - summary.caloriesConsumed;

  if (summary.caloriesConsumed === 0) {
    return "Nothing logged yet today — once you add your first meal I'll start tracking how your macros stack up against your targets.";
  }
  if (calPct > 1.05) {
    return `You're at ${Math.round(summary.caloriesConsumed)} kcal today, about ${Math.round(summary.caloriesConsumed - summary.caloriesGoal)} over your ${Math.round(summary.caloriesGoal)} target. No need to stress — just keep your next meal lighter and protein-forward to even things out.`;
  }
  if (proteinPct < 0.5 && hour >= 14) {
    return `You're at ${Math.round(summary.proteinG)}g of your ${Math.round(summary.proteinGoalG)}g protein goal so far — a bit behind pace for this time of day. A protein-rich snack now would help you catch up comfortably by tonight.`;
  }
  if (remaining >= 0 && remaining < 150) {
    return `You're right on pace today — only ${Math.round(remaining)} kcal left in your budget. Keep your next meal light or protein-focused and you'll land right on target.`;
  }
  return `Solid day so far: ${Math.round(summary.caloriesConsumed)} of ${Math.round(summary.caloriesGoal)} kcal logged and ${Math.round(proteinPct * 100)}% of your protein goal met. Keep this balance going.`;
}

export function answerQuickPrompt(promptId: string, summary: DailySummary): string {
  if (promptId === "progress") return buildDailyBrief(summary);
  if (promptId === "protein") {
    return `Good pick for closing the gap: ${pick(PROTEIN_SNACKS)}.`;
  }
  if (promptId === "swap") return pick(SWAP_TIPS);
  if (promptId === "macros") {
    return `You're set at ${Math.round(summary.caloriesGoal)} kcal a day — ${Math.round(summary.proteinGoalG)}g protein, ${Math.round(summary.carbsGoalG)}g carbs, ${Math.round(summary.fatGoalG)}g fat.`;
  }
  return "I'm not sure about that one yet — try one of the suggested questions below.";
}

export function answerFreeText(text: string, summary: DailySummary): string {
  const t = text.toLowerCase();
  if (t.includes("sugar") || t.includes("sweet")) {
    return "If cravings hit, pair something sweet with protein or fiber — fruit with nut butter, or yogurt with berries — it blunts the sugar spike and keeps you fuller.";
  }
  if (t.includes("tired") || t.includes("energy") || t.includes("sleep")) {
    return "Afternoon energy dips are often a carb-and-iron thing. A meal with slow carbs (oats, quinoa) plus leafy greens or lean red meat tends to help more than another coffee.";
  }
  if (t.includes("water") || t.includes("hydrat")) {
    return "A good rule of thumb is about 30–35ml of water per kg of bodyweight a day, more on training days. Herbal tea and water-rich produce count too.";
  }
  if (t.includes("protein")) {
    return `Right now you're at ${Math.round(summary.proteinG)}g of your ${Math.round(summary.proteinGoalG)}g protein target. Spreading it across 3–4 meals of 25–35g each is usually easier to hit than trying to catch up in one sitting.`;
  }
  return `Good question. Based on today's numbers — ${Math.round(summary.caloriesConsumed)} of ${Math.round(summary.caloriesGoal)} kcal and ${Math.round(summary.proteinG)}g of ${Math.round(summary.proteinGoalG)}g protein — I'd focus on keeping your next meal balanced rather than skipping it. Consistency beats perfection here.`;
}

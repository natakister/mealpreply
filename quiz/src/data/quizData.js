// Quiz Funnel Data - Single Source of Truth
// Changes here are automatically reflected in both the quiz and the structure page

export const phases = [
  { id: 'engagement', name: 'ENGAGEMENT', color: 'bg-blue-500', colorHex: '#3B82F6' },
  { id: 'context', name: 'CONTEXT', color: 'bg-cyan-500', colorHex: '#06B6D4' },
  { id: 'reality', name: 'REALITY', color: 'bg-amber-500', colorHex: '#F59E0B' },
  { id: 'diagnosis', name: 'DIAGNOSIS', color: 'bg-orange-500', colorHex: '#F97316' },
  { id: 'insight', name: 'INSIGHT', color: 'bg-pink-500', colorHex: '#EC4899' },
  { id: 'solution', name: 'SOLUTION', color: 'bg-emerald-500', colorHex: '#10B981' },
  { id: 'conversion', name: 'CONVERSION', color: 'bg-green-500', colorHex: '#22C55E' },
  { id: 'monetization', name: 'MONETIZATION', color: 'bg-purple-500', colorHex: '#A855F7' }
];

export const screens = [
  // ===== [1] WELCOME SCREEN =====
  {
    id: 1,
    type: 'welcome',
    phase: 'engagement',
    block: 'Welcome Screen',
    title: "Plan once. Prep twice. Eat all week.",
    subtitle: "A personalized meal system for YOUR family — built in under 2 minutes.",
    bullets: [
      "Portions calculated for your exact family size",
      "Recipes filtered for allergies, diets & picky eaters",
      "Breakfasts, lunches, and dinners — all covered"
    ],
    cta: "Build My System →",
    socialProof: "Based on the prep-ahead system used by professional meal preppers",
    trustBadge: "Instant access to your meal plan, shopping list & prep guides"
  },
  // ===== [2] GOAL ENTRY =====
  {
    id: 2,
    type: 'goal_entry',
    phase: 'engagement',
    block: 'Goal Entry',
    title: "What's your #1 goal with family meals?",
    description: "Pick the one that resonates most — we'll build your plan around it.",
    field: 'mainGoal',
    options: [
      { id: 'mental_load', text: "End the daily \"what to cook?\" stress", icon: '🧠' },
      { id: 'healthy_eating', text: "Get everyone eating healthier", icon: '🥗' },
      { id: 'food_waste', text: "Stop wasting food and money", icon: '♻️' },
      { id: 'time_saving', text: "Spend less time in the kitchen", icon: '⏱️' }
    ]
  },
  // ===== [3] IDEAL OUTCOME =====
  {
    id: 3,
    type: 'single',
    phase: 'engagement',
    block: 'Goals Block',
    title: "A month from now, what does success look like?",
    description: "Pick the one that excites you most.",
    field: 'idealOutcome',
    options: [
      { id: 'no_decisions', text: "I know exactly what we're eating — zero decisions", icon: '📋' },
      { id: 'calm_meals', text: "Mealtimes are calm, everyone eats, no battles", icon: '😌' },
      { id: 'organized', text: "Fridge organized, nothing spoils, no last-minute runs", icon: '🗂️' },
      { id: 'energy', text: "I have energy left after meals — cooking doesn't drain me", icon: '✨' }
    ],
    cta: "That's my goal →"
  },
  // ===== [4] MICRO-REWARD 1 =====
  {
    id: 4,
    type: 'micro_reward',
    phase: 'engagement',
    block: 'Micro-Reward 1',
    title: "Great choice. Let's make it happen.",
    stat: "89%",
    statText: "of families with your goal succeed with our system",
    cta: "Personalize my plan →"
  },
  // ===== [5] FAMILY SIZE =====
  {
    id: 5,
    type: 'number',
    phase: 'context',
    block: 'Context Block',
    title: "Who are we feeding?",
    description: "We'll calculate exact portions — no waste, no leftovers.",
    fields: [
      { id: 'adults', label: 'Adults', icon: '👨‍👩' },
      { id: 'kids', label: 'Kids', icon: '👧' }
    ],
    cta: "Continue →"
  },
  // ===== [6] DIETARY LIFESTYLES =====
  {
    id: 6,
    type: 'multi',
    phase: 'context',
    block: 'Context Block',
    title: "Any dietary lifestyles in your family?",
    description: "Select all that apply.",
    field: 'dietary',
    options: [
      { id: 'none', text: 'No specific diet', icon: '✅' },
      { id: 'vegetarian', text: 'Vegetarian', icon: '🥬' },
      { id: 'vegan', text: 'Vegan', icon: '🌱' },
      { id: 'pescatarian', text: 'Pescatarian', icon: '🐟' },
      { id: 'keto', text: 'Keto / Low-Carb', icon: '🥩' },
      { id: 'paleo', text: 'Paleo', icon: '🦴' },
      { id: 'mediterranean', text: 'Mediterranean', icon: '🫒' },
      { id: 'halal', text: 'Halal', icon: '☪️' },
      { id: 'kosher', text: 'Kosher', icon: '✡️' }
    ],
    cta: "Continue →"
  },
  // ===== [7] FOOD ALLERGIES & EXCLUSIONS =====
  {
    id: 7,
    type: 'multi_with_custom',
    phase: 'context',
    block: 'Context Block',
    title: "Any foods to completely exclude?",
    description: "Allergies, intolerances, or foods you hate. These will NEVER appear.",
    field: 'allergies',
    customField: 'customAllergies',
    customPlaceholder: "Other allergies (comma-separated)",
    options: [
      { id: 'none', text: 'No exclusions', icon: '✅' },
      { id: 'gluten', text: 'Gluten / Wheat', icon: '🌾' },
      { id: 'dairy', text: 'Dairy / Lactose', icon: '🥛' },
      { id: 'nuts', text: 'Tree Nuts', icon: '🌰' },
      { id: 'peanuts', text: 'Peanuts', icon: '🥜' },
      { id: 'eggs', text: 'Eggs', icon: '🥚' },
      { id: 'shellfish', text: 'Shellfish', icon: '🦐' },
      { id: 'soy', text: 'Soy', icon: '🫘' }
    ],
    cta: "Continue →"
  },
  // ===== [8] NUTRITION PRIORITIES =====
  {
    id: 8,
    type: 'multi',
    phase: 'context',
    block: 'Context Block',
    title: "Any nutrition priorities?",
    description: "Optional — helps us suggest better recipes.",
    field: 'nutritionPriorities',
    options: [
      { id: 'high_protein', text: 'High protein', icon: '💪' },
      { id: 'more_veggies', text: 'More vegetables', icon: '🥦' },
      { id: 'lower_sugar', text: 'Lower sugar', icon: '🍬' },
      { id: 'lower_sodium', text: 'Lower sodium', icon: '🧂' },
      { id: 'budget', text: 'Budget-friendly', icon: '💰' },
      { id: 'skip', text: 'No preference', icon: '⏭️' }
    ],
    cta: "Continue →"
  },
  // ===== [9] KIDS CHALLENGE (conditional) =====
  {
    id: 9,
    type: 'single',
    phase: 'context',
    block: 'Context Block',
    conditional: 'hasKids',
    title: "What's the biggest challenge with feeding your kids?",
    description: "We'll add smart swaps and kid-tested options.",
    field: 'kidsChallenge',
    options: [
      { id: 'picky', text: "They reject most new foods", icon: '🙈' },
      { id: 'veggies', text: "Won't eat vegetables", icon: '🥦' },
      { id: 'different_meals', text: "Want different meals than adults", icon: '🍕' },
      { id: 'school_lunches', text: "School lunches are chaos", icon: '🎒' },
      { id: 'no_challenge', text: "They eat most things", icon: '🎉' }
    ],
    cta: "Continue →"
  },
  // ===== [10] KITCHEN EQUIPMENT =====
  {
    id: 10,
    type: 'multi',
    phase: 'context',
    block: 'Context Block',
    title: "What equipment do you have?",
    description: "We'll only suggest recipes you can actually make.",
    field: 'kitchenEquipment',
    options: [
      { id: 'basic', text: 'Basics (stovetop & oven)', icon: '🍳' },
      { id: 'instant_pot', text: 'Instant Pot / Pressure Cooker', icon: '⚡' },
      { id: 'slow_cooker', text: 'Slow Cooker / Crockpot', icon: '🍲' },
      { id: 'air_fryer', text: 'Air Fryer', icon: '🍟' },
      { id: 'blender', text: 'Blender / Food Processor', icon: '🥤' },
      { id: 'sheet_pans', text: 'Sheet Pans', icon: '🍪' },
      { id: 'grill', text: 'Grill / BBQ', icon: '🔥' }
    ],
    cta: "Continue →"
  },
  // ===== [11] MEAL COMPLEXITY =====
  {
    id: 11,
    type: 'multi',
    phase: 'context',
    block: 'Context Block',
    title: "What types of meals work for you?",
    description: "Select all that fit your lifestyle.",
    field: 'mealComplexity',
    options: [
      {
        id: 'assembly',
        text: "Assembly meals (5 min)",
        icon: '🥗',
        desc: "Pre-prepped components, just combine",
        examples: "Buddha bowls, wraps, grain bowls"
      },
      {
        id: 'simple',
        text: "Simple cooking (15-30 min)",
        icon: '🍳',
        desc: "Minimal prep, straightforward recipes",
        examples: "Sheet pan dinners, pasta, stir-fry"
      },
      {
        id: 'complex',
        text: "Complex cooking (45+ min)",
        icon: '👨‍🍳',
        desc: "I enjoy cooking and want full variety",
        examples: "Casseroles, braises, baked dishes"
      }
    ],
    cta: "Continue →"
  },
  // ===== [12] MICRO-REWARD 2 =====
  {
    id: 12,
    type: 'micro_reward_progress',
    phase: 'context',
    block: 'Micro-Reward 2',
    title: "Your plan is taking shape.",
    progressItems: [
      { label: 'people', dynamic: 'totalPeople' },
      { label: 'diet filters', dynamic: 'dietaryCount' },
      { label: 'excluded ingredients', dynamic: 'allergiesCount' },
      { label: 'kitchen tools', dynamic: 'equipmentCount' }
    ],
    recipesText: "compatible recipes found",
    cta: "Almost there →"
  },
  // ===== [13] INTERSTITIAL: Reality Bridge =====
  {
    id: 13,
    type: 'interstitial_dynamic',
    phase: 'reality',
    block: 'Reality Bridge',
    title: "Now let's find what's not working.",
    dynamicKey: 'interstitial3',
    cta: "Diagnose my situation →"
  },
  // ===== [14] CURRENT FREQUENCY =====
  {
    id: 14,
    type: 'single',
    phase: 'reality',
    block: 'Reality Block',
    title: "How many home-cooked meals per week?",
    description: "No judgment — we meet you where you are.",
    field: 'currentFrequency',
    options: [
      { id: 'rarely', text: "0-3 meals — mostly takeout", icon: '🥡' },
      { id: 'sometimes', text: "4-7 meals — inconsistent", icon: '🍳' },
      { id: 'often', text: "8-14 meals — regular but exhausting", icon: '👨‍🍳' },
      { id: 'always', text: "15+ meals — cooking takes over life", icon: '😰' }
    ],
    cta: "Continue →"
  },
  // ===== [15] MIDWEEK PATTERN =====
  {
    id: 15,
    type: 'single',
    phase: 'reality',
    block: 'Reality Block',
    title: "What usually happens by Wednesday?",
    description: "This is the #1 predictor of meal plan success.",
    field: 'midweekPattern',
    options: [
      { id: 'on_track', text: "Still on track", icon: '✅' },
      { id: 'improvise', text: "Start improvising", icon: '🔀' },
      { id: 'food_spoils', text: "Something has gone bad", icon: '🥬' },
      { id: 'exhausted', text: "Too tired — we order food", icon: '😩' },
      { id: 'never_tried', text: "Never stuck with a plan", icon: '🤷' }
    ],
    cta: "Find my pattern →"
  },
  // ===== [16] PRIORITY (Dynamic) =====
  {
    id: 16,
    type: 'single_dynamic',
    phase: 'diagnosis',
    block: 'Diagnosis Block',
    title: "If we solve ONE thing this week, what should it be?",
    description: "Your plan will be built around this.",
    field: 'priority',
    dynamicOptions: true,
    cta: "Build my plan →"
  },
  // ===== [17] ANALYZING =====
  {
    id: 17,
    type: 'analyzing',
    phase: 'diagnosis',
    block: 'Analyzing',
    title: "Building your personalized system...",
    cta: "See my results →"
  },
  // ===== [18] INSIGHT MIRROR =====
  {
    id: 18,
    type: 'insight',
    phase: 'insight',
    block: 'Insight Mirror',
    title: "Here's what we discovered:",
    cta: "Show me the solution →"
  },
  // ===== [19] SOLUTION PREVIEW =====
  {
    id: 19,
    type: 'solution',
    phase: 'solution',
    block: 'Solution Preview',
    cta: "See my 7-day plan →"
  },
  // ===== [20] VALUE DEMONSTRATION =====
  {
    id: 20,
    type: 'value_demo',
    phase: 'conversion',
    block: 'Value Demonstration',
    title: "Your Week 1 Plan Preview",
    cta: "Get my full plan →"
  },
  // ===== [21] LEAD CAPTURE =====
  {
    id: 21,
    type: 'email',
    phase: 'conversion',
    block: 'Lead Capture',
    title: "Where should we send your plan?",
    testimonial: {
      text: "I got 4 hours of my week back. My kids actually eat dinner now without complaints.",
      author: "Sarah, mom of 3"
    },
    cta: "Send my plan →"
  },
  // ===== [22] TRANSFORMATION PAYWALL =====
  {
    id: 22,
    type: 'paywall',
    phase: 'monetization',
    block: 'Transformation Paywall',
    title: "Your life with vs. without the system",
    pricing: {
      trial: "14-day free trial",
      price: "$14.99/month",
      guarantee: "Cancel anytime • 30-day money-back"
    },
    socialProof: "4.8 from 12,847 reviews",
    cta: "Start my free trial →"
  }
];

// Dynamic content templates
export const dynamicContent = {
  interstitial3: {
    mental_load: "You're making {decisionsPerDay}+ food decisions daily. Let's find where the system breaks down.",
    healthy_eating: "Getting picky eaters to try new foods is hard. Let's see what's actually happening.",
    healthy_eating_picky: "Getting picky eaters to try new foods is hard. Let's see what's actually happening.",
    food_waste: "Families like yours waste ~${wastedFoodPerMonth}/month on spoiled food. Let's find out why.",
    time_saving: "You're spending {hoursPerWeek}+ hours weekly on food. Let's see where it's going.",
    default: "To build a system that works, we need to understand what's not working now."
  },

  mainChallenge: {
    mental_load: "You're making {decisionsPerYear}+ food decisions per year. That's {daysPerYear} full days of mental energy — just on \"what should we eat?\"",
    healthy_eating: "You want your family to eat healthier, but getting everyone on board feels like a daily battle.",
    food_waste: "Based on your pattern, you're likely wasting ${wastedFoodPerYear}/year on food that spoils before you use it. That's not a willpower problem — it's a freshness cycle problem.",
    time_saving: "You're spending {hoursPerYear} hours per year on food — that's {daysPerYear} full days. What would you do with that time back?"
  },

  patternInsight: {
    on_track: "Your planning works, but you want to optimize and make it effortless.",
    improvise: "You start strong, but by Wednesday you're improvising — which brings back all the stress you were trying to avoid.",
    food_spoils: "Your plans derail when food spoils. This isn't about planning better — it's about a 4-day freshness cycle instead of 7.",
    exhausted: "By midweek, you're too exhausted to cook. That's exactly when the guilt kicks in.",
    never_tried: "You haven't found a system realistic enough to try. Most meal plans assume you have time you don't have."
  },

  solutionHeadline: {
    mental_load: "Zero daily food decisions. Here's how:",
    healthy_eating: "Healthy meals everyone actually eats. Here's how:",
    food_waste: "Nothing spoils. Nothing wasted. Here's how:",
    time_saving: "{weeklyTimeSaved} hours back every week. Here's how:"
  },

  priorityBenefit: {
    decisions: "Your entire week is planned. Just open the app and assemble. No thinking required.",
    picky_eaters: "Same base ingredients, different presentations. Everyone eats, nobody complains.",
    no_waste: "4-day freshness cycle. Two prep sessions mean nothing sits long enough to spoil.",
    save_time: "5-minute assembly. Components are ready. You just combine and serve.",
    school_lunches: "Every meal packs perfectly. No reheating needed. Mornings become easy.",
    flexibility: "Swap meals, adjust portions, life happens — the system adapts with you.",
    healthy: "Nutritious meals disguised as comfort food. No fights. No complaints."
  }
};

// Priority options generation logic
export const priorityOptionsConfig = {
  goalOptions: {
    mental_load: { id: 'decisions', text: "Take all daily food decisions off my plate", icon: '🧠' },
    healthy_eating: { id: 'healthy', text: "Help my family eat nutritious meals without fights", icon: '🥗' },
    food_waste: { id: 'no_waste', text: "Stop throwing away food that spoiled", icon: '♻️' },
    time_saving: { id: 'save_time', text: "Cut cooking time in half", icon: '⏱️' }
  },
  patternOptions: {
    food_spoils: { id: 'no_waste', text: "A system where nothing goes bad", icon: '🥬' },
    exhausted: { id: 'save_time', text: "5-minute meals on tired days", icon: '😴' },
    improvise: { id: 'flexibility', text: "A flexible plan that survives real life", icon: '🔄' }
  },
  kidsOptions: {
    picky: { id: 'picky_eaters', text: "Get my kids to actually eat", icon: '👶' },
    school_lunches: { id: 'school_lunches', text: "Easy packable lunches", icon: '🎒' }
  },
  defaults: [
    { id: 'decisions', text: "Take all daily food decisions off my plate", icon: '🧠' },
    { id: 'save_time', text: "Spend less time cooking", icon: '⏱️' },
    { id: 'no_waste', text: "Stop wasting food and money", icon: '♻️' },
    { id: 'flexibility', text: "A plan that adapts to chaos", icon: '🔄' }
  ]
};

// Paywall content
export const paywallContent = {
  withoutSystem: [
    { icon: '😰', text: 'Daily stress about what to cook' },
    { icon: '🥬', text: 'Food going bad in the fridge' },
    { icon: '😩', text: 'Exhausted by dinner time' },
    { icon: '💸', text: '~${wastedFoodPerMonth}/month wasted on food' }
  ],
  withSystem: [
    { icon: '😌', text: 'Zero decisions — just open and assemble' },
    { icon: '✨', text: 'Fresh ingredients, zero waste' },
    { icon: '⚡', text: '5-minute meals, energy to spare' },
    { icon: '💰', text: 'Save ~${monthlySavings}/month on groceries' }
  ]
};

// Sample recipes for value demo
export const sampleRecipes = [
  { name: 'Mediterranean Chicken Bowls', time: '5 min', img: '🥗' },
  { name: 'Honey Garlic Shrimp Wraps', time: '5 min', img: '🌯' },
  { name: 'Teriyaki Beef Bowls', time: '5 min', img: '🍚' }
];

// Type labels for structure view
export const typeLabels = {
  welcome: 'Welcome Screen',
  goal_entry: 'Single Choice (auto-advance)',
  single: 'Single Choice (auto-advance)',
  single_dynamic: 'Single Choice Dynamic',
  multi: 'Multi Select',
  multi_with_custom: 'Multi Select + Custom Input',
  number: 'Number Input',
  micro_reward: 'Micro Reward',
  micro_reward_progress: 'Progress Summary',
  interstitial_dynamic: 'Interstitial (dynamic text)',
  analyzing: 'Analyzing Animation',
  insight: 'Insight Mirror',
  solution: 'Solution Preview',
  value_demo: 'Value Demo',
  email: 'Email Capture',
  paywall: 'Paywall'
};

import { X, Utensils, Clock, Flame } from "lucide-react";

const meals = [
  {
    time: "7:00 AM",
    name: "Breakfast",
    items: [
      "6 egg whites + 2 whole eggs scrambled",
      "1 cup oatmeal with banana",
      "1 tbsp peanut butter",
      "1 glass whole milk",
    ],
    calories: 720,
    protein: 48,
  },
  {
    time: "10:00 AM",
    name: "Snack 1",
    items: [
      "Greek yogurt (200g)",
      "Handful of almonds (30g)",
      "1 apple",
    ],
    calories: 380,
    protein: 25,
  },
  {
    time: "1:00 PM",
    name: "Lunch",
    items: [
      "250g grilled chicken breast",
      "1.5 cups brown rice",
      "Mixed vegetables",
      "1 tbsp olive oil",
    ],
    calories: 780,
    protein: 55,
  },
  {
    time: "4:00 PM",
    name: "Pre-Workout",
    items: [
      "Protein shake (2 scoops)",
      "1 banana",
      "2 rice cakes with honey",
    ],
    calories: 450,
    protein: 45,
  },
  {
    time: "7:00 PM",
    name: "Dinner",
    items: [
      "250g lean beef or salmon",
      "Sweet potato (200g)",
      "Steamed broccoli",
      "Mixed salad with olive oil",
    ],
    calories: 750,
    protein: 50,
  },
  {
    time: "9:30 PM",
    name: "Pre-Bed Snack",
    items: [
      "Cottage cheese (200g)",
      "1 tbsp honey",
      "Handful of walnuts",
    ],
    calories: 430,
    protein: 32,
  },
];

export default function MealPlanModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const totalCals = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-md max-h-[85vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Utensils size={16} className="text-orange-400" />
              Muscle Building Meal Plan
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              3,500 kcal · High Protein
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Totals bar */}
        <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-around shrink-0">
          <div className="text-center">
            <p className="text-lg font-bold text-orange-400">{totalCals}</p>
            <p className="text-[9px] text-slate-500 uppercase">Calories</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-lg font-bold text-neon-blue">{totalProtein}g</p>
            <p className="text-[9px] text-slate-500 uppercase">Protein</p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">6</p>
            <p className="text-[9px] text-slate-500 uppercase">Meals</p>
          </div>
        </div>

        {/* Meal list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
          {meals.map((meal, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock size={10} />
                    {meal.time}
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {meal.name}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                    <Flame size={10} />
                    {meal.calories}
                  </span>
                  <span className="text-[10px] text-neon-blue font-medium">
                    {meal.protein}g P
                  </span>
                </div>
              </div>
              <ul className="space-y-1">
                {meal.items.map((item, j) => (
                  <li
                    key={j}
                    className="text-[11px] text-slate-400 flex items-start gap-1.5"
                  >
                    <span className="text-slate-600 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

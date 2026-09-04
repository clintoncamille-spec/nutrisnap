import { useMemo, useReducer } from "react";
import type { FoodItem, MacroBreakdown } from "../api/types";
import { scaleItemToGrams, sumMacros } from "../lib/macroMath";

type Action =
  | { type: "reset"; items: FoodItem[] }
  | { type: "setGrams"; id: string; grams: number }
  | { type: "remove"; id: string }
  | { type: "add"; item: FoodItem };

function reducer(state: FoodItem[], action: Action): FoodItem[] {
  switch (action.type) {
    case "reset":
      return action.items;
    case "setGrams":
      return state.map((item) =>
        item.id === action.id ? scaleItemToGrams(item, action.grams) : item,
      );
    case "remove":
      return state.filter((item) => item.id !== action.id);
    case "add":
      return [...state, action.item];
    default:
      return state;
  }
}

export function useEditableFoodItems(initial: FoodItem[]) {
  const [items, dispatch] = useReducer(reducer, initial);

  const totals: MacroBreakdown = useMemo(() => sumMacros(items), [items]);

  return {
    items,
    totals,
    reset: (next: FoodItem[]) => dispatch({ type: "reset", items: next }),
    setGrams: (id: string, grams: number) =>
      dispatch({ type: "setGrams", id, grams }),
    remove: (id: string) => dispatch({ type: "remove", id }),
    add: (item: FoodItem) => dispatch({ type: "add", item }),
  };
}

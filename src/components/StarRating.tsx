"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}
        >
          <Star
            className={`${starSize} ${
              value !== null && star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

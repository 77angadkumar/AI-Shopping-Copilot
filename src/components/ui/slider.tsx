import * as React from "react";

export interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: number[];
  onValueChange: (value: number[]) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ min, max, step = 1, value, onValueChange, className = "" }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange([Number(e.target.value)]);
  };

  return (
    <div className={`relative flex w-full touch-none select-none items-center py-2 ${className}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0] || min}
        onChange={handleChange}
        className="w-full h-1.5 bg-muted border border-border rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
    </div>
  );
};

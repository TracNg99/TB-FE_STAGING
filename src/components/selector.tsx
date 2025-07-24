import React from 'react';

import { cn } from '@/utils/class';

interface SelectorProps {
  className?: string;
  icon?: React.ReactNode;
  label?: string;
  options: {
    value: string;
    label: string;
    icon: string;
  }[];
  value: string;
  onChange: (value: string) => void;
}

const Selector: React.FC<SelectorProps> = ({
  className,
  icon,
  label,
  options,
  value,
  onChange,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <div className="flex items-center gap-2">
          {icon}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        </div>
      )}
      <div className="relative w-full">
        <select
          defaultValue={value}
          value={value}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-8 appearance-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} &nbsp; {option.label}
            </option>
          ))}
        </select>
        {/* Arrow at the end */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Selector;

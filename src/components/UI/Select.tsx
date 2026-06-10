import { Controller, Control, FieldValues, Path } from "react-hook-form";

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function Select<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = "Select an option",
  disabled = false,
  error,
  className,
}: SelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const currentValue = field.value ?? "";

        return (
          <div className="space-y-1.5">
            {label && (
              <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 dark:text-gray-900"
              >
                {label}
              </label>
            )}

            <div className="relative">
              <select
                id={name}
                ref={field.ref}
                value={currentValue}
                onChange={(event) => {
                  const selectedOption = options.find(
                    (opt) => String(opt.value) === event.target.value,
                  );
                  field.onChange(
                    selectedOption ? selectedOption.value : event.target.value,
                  );
                }}
                onBlur={field.onBlur}
                disabled={disabled}
                className={`
                w-full appearance-none rounded-lg border px-3 py-2.5 pr-10 text-sm
                bg-white 
                text-gray-900 dark:text-gray-900
                outline-none transition-all duration-200
                disabled:bg-gray-100 dark:disabled:bg-gray-700 
                disabled:text-gray-500 dark:disabled:text-gray-400
                disabled:cursor-not-allowed
                ${
                  error
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }
                ${className}
              `}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Custom Chevron Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        );
      }}
    />
  );
}

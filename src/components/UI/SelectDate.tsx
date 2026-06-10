import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface DateTimePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  type:string;
  defaultValue?: string | Date | null;
}

// Helper: Convert Date/ISO string to "YYYY-MM-DDTHH:mm" format required by native input
const formatDateForInput = (date: Date | string | null | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  // Crucial: Adjust for timezone offset so the date doesn't shift in the input
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function DateTimePicker<T extends FieldValues>({
  name,
  control,
  label,
  type,
  disabled = false,
  readOnly = false,
  defaultValue = "",
}: DateTimePickerProps<T>) {

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue as any}
      render={({ field }) => {
        const inputValue = formatDateForInput(field.value);

        return (
          <div className="space-y-1.5">
            <label 
              htmlFor={name} 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {label}
            </label>
            
            <div className="relative">
              <input
                id={name}
                type={type}
                value={inputValue}
                onChange={(e) => {
                  // Convert the input string back to a Date object for react-hook-form
                  const newValue = e.target.value ? new Date(e.target.value) : null;
                  field.onChange(newValue);
                }}
                disabled={disabled}
                readOnly={readOnly}
                className={`
                  w-full rounded-lg border px-3 py-2.5 pr-10 text-sm
                  bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-white
                  outline-none transition-all duration-200
                  disabled:bg-gray-100 dark:disabled:bg-gray-700 
                  disabled:text-gray-500 dark:disabled:text-gray-400
                  disabled:cursor-not-allowed
                  ${readOnly ? "cursor-default" : "cursor-pointer"}
                  ${
                    disabled || readOnly
                      ? "border-gray-200 dark:border-gray-600"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                `}
              />
              
              {/* Custom Calendar/Clock Icon */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={1.5}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
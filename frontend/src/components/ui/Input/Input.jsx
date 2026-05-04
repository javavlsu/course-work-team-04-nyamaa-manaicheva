import { cn } from "@/utils/cn";

export const Input = ({
  label,
  variant = "filled",
  error = false,
  className,
  required,
  ...props
}) => {
  const baseStyles =
    "w-full px-[25px] py-[20px] rounded-[var(--rounded-base)] outline-none transition-colors duration-200 text-[20px]";

  const variants = {
    filled: "bg-light-gray text-dark-gray placeholder:text-dark-gray",
    outline:
      "bg-transparent border border-[var(--color-gray)] text-white placeholder:text-gray-400",
  };

  const errorStyles = error ? "border border-[var(--color-orange)]" : "";

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[24px]">
          {label}
          {required && <span className="text-[var(--color-orange)] ml-1">*</span>}
        </label>
      )}

      <input
        className={cn(baseStyles, variants[variant], errorStyles, className)}
        required={required}
        {...props}
      />
    </div>
  );
};

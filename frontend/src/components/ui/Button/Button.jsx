import { cn } from "@/utils/cn";

export const Button = ({ variant = "primary", icon: Icon, children, className, ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--rounded-base)] font-semibold transition-colors duration-200 text-[24px] cursor-pointer";

  const variants = {
    primary: "bg-[var(--color-light-blue)] text-white hover:brightness-90",

    outlineBlue:
      "border border-[var(--color-light-blue)] text-[var(--color-light-blue)] bg-transparent hover:bg-[var(--color-light-blue)] hover:text-white",

    outlineOrange:
      "border border-[var(--color-orange)] text-[var(--color-orange)] bg-transparent hover:bg-[var(--color-orange)] hover:text-white",

    outlineGray:
      "border border-[var(--color-gray)] text-[var(--color-gray)] bg-transparent hover:bg-[var(--color-gray)] hover:text-black",

    iconText:
      "border border-[var(--color-dark-blue)] text-[var(--color-dark-blue)] bg-transparent hover:bg-[var(--color-dark-blue)] hover:text-white",

    iconOnly:
      "p-2 border border-[var(--color-dark-blue)] text-[var(--color-dark-blue)] bg-transparent hover:bg-[var(--color-dark-blue)] hover:text-white",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {Icon && <Icon size={40} />}
      {variant !== "iconOnly" && children}
    </button>
  );
};

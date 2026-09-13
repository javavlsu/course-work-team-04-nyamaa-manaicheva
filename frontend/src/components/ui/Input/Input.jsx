import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import "./Input.css";

function Input({
  name,
  label,
  type,
  placeholder,
  autoComplete,
  validation,
  requiredIndicator = false,
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const error = errors[name];
  const showRequired = requiredIndicator && Boolean(validation?.required);

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={name}>
        {label}
        {showRequired && <span className="input-label-required">*</span>}
      </label>
      <div className="input-wrapper">
        <input
          id={name}
          type={isPassword && visible ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input${error ? " input-invalid" : ""}${isPassword ? " input-password" : ""}`}
          {...register(name, validation)}
        />
        {isPassword && (
          <button
            type="button"
            className="input-toggle"
            aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
            onClick={() => setVisible((value) => !value)}
          >
            {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && <span className="input-error">{error.message}</span>}
    </div>
  );
}

export default Input;

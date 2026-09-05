import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { EyeIcon, EyeOffIcon } from "./icons";
import "./Input.css";

function Input({ name, label, type, placeholder, autoComplete, validation }) {
  const { register, formState: { errors } } = useFormContext();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const error = errors[name];

  return (
    <div className="input-group">
      <label className="input-label" htmlFor={name}>
        {label}
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
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && <span className="input-error">{error.message}</span>}
    </div>
  );
}

export default Input;

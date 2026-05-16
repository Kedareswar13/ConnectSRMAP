"use client";
import { Eye, EyeOff } from "lucide-react";
import React, { ChangeEvent, useState } from "react";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  inputClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput = ({
  name,
  label,
  placeholder = "Enter Password",
  value,
  onChange,
  inputClassName = "",
  labelClassName = "",
  iconClassName = "",
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {label && (
        <label className={`text-xs font-semibold text-white/60 mb-2 block uppercase tracking-wider ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          name={name}
          onChange={onChange}
          className={`input-auth px-4 py-3 w-full pr-10 ${inputClassName}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`absolute outline-none right-3 top-3 p-0 text-white/30 hover:text-white/60 transition-colors ${iconClassName}`}
        >
          {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      </div>
    </>
  );
};

export default PasswordInput;

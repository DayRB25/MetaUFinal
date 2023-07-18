import * as React from "react";
import { useEffect, useState } from "react";

import "./InputForm.css";

export default function InputForm({ value, handleChange, type, placeholder }) {
  return (
    <div className="input-form">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      ></input>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";
import { navigateTo } from "../utils/navigation";

const Calculator = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  // Validate value from click/key press and append to input if possible
  const handleClick = (value) => {
    // Prevent starting with an operator
    if (input === "" && ["+", "-", "*", "/"].includes(value)) return;
  
    // Prevent consecutive operators
    if (["+", "-", "*", "/"].includes(value) && ["+", "-", "*", "/"].includes(input.slice(-1))) {
      return;
    }
  
    setInput((prev) => prev + value);
  };  

  // Clear input
  const handleClear = () => {
    setInput("");
    setResult("");
  };

  // Perform calculation based on input using mathjs.
  // Due to useEffect caching, we need useCallback to fetch the
  // latest input value when Enter is pressed.
  const handleCalculate = useCallback(() => {
    try {
      setResult(evaluate(input));
    } catch {
      setResult("Error");
    }
  }, [input]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
  
      if (!isNaN(key) || ["+", "-", "*", "/", "."].includes(key)) {
        handleClick(key);
      } else if (key === "Enter") {
        event.preventDefault();
        handleCalculate();
      } else if (key === "Backspace") {
        setInput((prev) => prev.slice(0, -1));
      } else if (key === "Escape") {
        handleClear();
      }
    };
  
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleCalculate]); // min-h-screen bg-teal-300 flex flex-col items-center p-5

  return (
    <div className="min-h-screen bg-emerald-300 text-white flex flex-col items-center justify-center p-5 animate-fadeIn">
    {/* Home Button */}
    <button
      onClick={() => navigateTo('/')}
      className="fixed top-4 left-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 z-50"
    >
      🏠
    </button>
      <div className="flex flex-col items-center bg-orange-100 p-4 rounded-lg shadow-lg w-fit">
        <div className="w-80 bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="mb-4 p-4 bg-gray-700 text-right text-2xl rounded-lg shadow-inner backdrop-blur-lg bg-opacity-50">
            {input || "0"}
          </div>
          <div className="mb-4 p-4 bg-gray-600 text-right text-2xl rounded-lg shadow-inner backdrop-blur-lg bg-opacity-50">
            {result}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["7", "8", "9", "/"].map((char) => (
              <button
                key={char}
                className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 active:bg-gray-500 transition-all duration-200"
                onClick={() => handleClick(char)}
              >
                {char}
              </button>
            ))}
            {["4", "5", "6", "*"].map((char) => (
              <button
                key={char}
                className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 active:bg-gray-500 transition-all duration-200"
                onClick={() => handleClick(char)}
              >
                {char}
              </button>
            ))}
            {["1", "2", "3", "-"].map((char) => (
              <button
                key={char}
                className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 active:bg-gray-500 transition-all duration-200"
                onClick={() => handleClick(char)}
              >
                {char}
              </button>
            ))}
            {["0", ".", "=", "+"].map((char) => (
              <button
                key={char}
                className="p-4 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 active:bg-gray-500 transition-all duration-200 transform active:scale-90"
                onClick={char === "=" ? handleCalculate : () => handleClick(char)}
              >
                {char}
              </button>
            ))}
            <button
              className="col-span-2 p-4 bg-red-600 rounded"
              onClick={handleClear}
            >
              C
            </button>
          </div>
        </div>
      </div>
    </div>
  );  
}

export default Calculator;

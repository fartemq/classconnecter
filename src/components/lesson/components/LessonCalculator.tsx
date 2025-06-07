
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Delete, RotateCcw } from "lucide-react";

export const LessonCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clearAll = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      setDisplay(display.charAt(0) === '-' ? display.substr(1) : '-' + display);
    }
  };

  const inputPercent = () => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  };

  const buttons = [
    { label: 'C', onClick: clearAll, className: 'bg-red-500 hover:bg-red-600 text-white' },
    { label: 'CE', onClick: clearEntry, className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { label: '⌫', onClick: () => setDisplay(display.slice(0, -1) || '0'), className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    { label: '÷', onClick: () => inputOperation('÷'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '7', onClick: () => inputNumber('7'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '8', onClick: () => inputNumber('8'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '9', onClick: () => inputNumber('9'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '×', onClick: () => inputOperation('×'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '4', onClick: () => inputNumber('4'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '5', onClick: () => inputNumber('5'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '6', onClick: () => inputNumber('6'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '-', onClick: () => inputOperation('-'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '1', onClick: () => inputNumber('1'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '2', onClick: () => inputNumber('2'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '3', onClick: () => inputNumber('3'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '+', onClick: () => inputOperation('+'), className: 'bg-blue-500 hover:bg-blue-600 text-white' },
    
    { label: '±', onClick: toggleSign, className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '0', onClick: () => inputNumber('0'), className: 'bg-gray-200 hover:bg-gray-300' },
    { label: ',', onClick: inputDecimal, className: 'bg-gray-200 hover:bg-gray-300' },
    { label: '=', onClick: performCalculation, className: 'bg-green-500 hover:bg-green-600 text-white' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <Input
          value={display}
          readOnly
          className="text-right text-xl font-mono bg-gray-50"
        />
      </div>
      
      <div className="grid grid-cols-4 gap-2 flex-1">
        {buttons.map((button, index) => (
          <Button
            key={index}
            onClick={button.onClick}
            className={`h-12 text-lg font-semibold ${button.className}`}
            variant="outline"
          >
            {button.label}
          </Button>
        ))}
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button 
          onClick={inputPercent}
          variant="outline"
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          %
        </Button>
        <Button 
          onClick={() => {
            const value = parseFloat(display);
            setDisplay(String(Math.sqrt(value)));
          }}
          variant="outline"
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          √
        </Button>
      </div>
    </div>
  );
};

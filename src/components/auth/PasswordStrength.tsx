import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
}

interface PasswordCriteria {
  test: (password: string) => boolean;
  label: string;
}

const criteria: PasswordCriteria[] = [
  { test: (p) => p.length >= 8, label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p) => /\d/.test(p), label: "One number" },
  {
    test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    label: "One special character",
  },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showCriteria = true,
}) => {
  const passedCriteria = criteria.filter((criterion) =>
    criterion.test(password)
  );
  const strength = passedCriteria.length;

  const getStrengthColor = (strength: number) => {
    if (strength < 2) return "bg-destructive";
    if (strength < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return "Weak";
    if (strength < 4) return "Medium";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={`font-medium ${
              strength < 2
                ? "text-destructive"
                : strength < 4
                ? "text-yellow-600"
                : "text-green-600"
            }`}
          >
            {getStrengthText(strength)}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getStrengthColor(strength)}`}
            initial={{ width: 0 }}
            animate={{ width: `${(strength / criteria.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {showCriteria && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="space-y-1"
        >
          {criteria.map((criterion, index) => {
            const passed = criterion.test(password);
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 text-xs ${
                  passed ? "text-green-600" : "text-muted-foreground"
                }`}
              >
                {passed ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <X className="h-3 w-3" />
                )}
                <span>{criterion.label}</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

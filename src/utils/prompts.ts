import inquirer, { QuestionCollection, Answers } from "inquirer";
import { PricingModel } from "../types";
import { readFileSync } from "fs";
import { join } from "path";

interface PackageJson {
  name: string;
  version: string;
  publisher?: string;
}

/**
 * Login prompt questions
 */
export interface LoginAnswers extends Answers {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
  company?: string;
  publisher?: string;
  confirmationCode?: string;
}

function getDefaultPublisher(): string {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson: PackageJson = JSON.parse(
      readFileSync(packageJsonPath, "utf-8")
    );
    return packageJson.publisher || "";
  } catch {
    return "";
  }
}

export const loginPrompts: QuestionCollection<LoginAnswers> = [
  {
    name: "email",
    message: "Enter your email:",
    type: "input",
    validate: (input: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(input) || "Please enter a valid email address";
    },
  },
  {
    name: "password",
    message: "Enter your password:",
    type: "password",
    validate: (input: string) =>
      input.length >= 8 || "Password must be at least 8 characters long",
  },
  {
    name: "givenName",
    message: "Enter your first name:",
    type: "input",
    validate: (input: string) => input.length > 0 || "First name is required",
  },
  {
    name: "familyName",
    message: "Enter your last name:",
    type: "input",
    validate: (input: string) => input.length > 0 || "Last name is required",
  },
  {
    name: "company",
    message: "Enter your company name (optional):",
    type: "input",
  },
  {
    name: "publisher",
    message: "Enter your publisher name:",
    type: "input",
    default: getDefaultPublisher,
    validate: (input: string) => input.length > 0 || "Publisher ID is required",
  },
];

export const confirmationPrompt: QuestionCollection<LoginAnswers> = [
  {
    name: "confirmationCode",
    message: "Enter the confirmation code from your email:",
    type: "input",
    validate: (input: string) =>
      (input.length === 6 && /^\d+$/.test(input)) ||
      "Please enter a valid 6-digit confirmation code",
  },
];

/**
 * Pricing model prompt questions
 */
export interface PricingAnswers extends Answers {
  model: PricingModel;
  price: string;
  customPrice?: string;
  freeTrialDays?: number;
}

export const pricingPrompts: QuestionCollection<PricingAnswers> = [
  {
    name: "model",
    message: "Choose pricing model:",
    type: "list",
    choices: [
      { name: "Monthly Subscription", value: "subscription" },
      { name: "One-time Purchase", value: "one-time" },
    ],
  },
  {
    name: "price",
    message: "Select price:",
    type: "list",
    choices: [
      { name: "$2.99", value: "2.99" },
      { name: "$4.99", value: "4.99" },
      { name: "$9.99", value: "9.99" },
      { name: "Custom Price", value: "custom" },
    ],
  },
  {
    name: "customPrice",
    message: "Enter custom price (between $2.99 and $99.99):",
    type: "input",
    when: (answers: PricingAnswers) => answers.price === "custom",
    validate: (input: string) => {
      const price = parseFloat(input);
      if (isNaN(price)) {
        return "Please enter a valid number";
      }
      if (price < 2.99 || price > 99.99) {
        return "Price must be between $2.99 and $99.99";
      }
      return true;
    },
  },
  {
    name: "freeTrialDays",
    message: "Enter number of free trial days (0 for no trial):",
    type: "number",
    when: (answers: PricingAnswers) => answers.model === "subscription",
    default: 0,
    validate: (input: number) => {
      if (isNaN(input) || !Number.isInteger(input)) {
        return "Please enter a valid integer";
      }
      if (input < 0 || input > 90) {
        return "Free trial days must be between 0 and 90";
      }
      return true;
    },
  },
];

/**
 * License creation prompts
 */
export interface LicenseAnswers extends Answers {
  maxMachines: number;
  expirationDate: string;
}

export const licensePrompts: QuestionCollection<LicenseAnswers> = [
  {
    name: "maxMachines",
    message: "Enter maximum number of machines:",
    type: "number",
    validate: (input: number) => {
      if (isNaN(input) || !Number.isInteger(input)) {
        return "Please enter a valid integer";
      }
      if (input < 1) {
        return "Number of machines must be at least 1";
      }
      return true;
    },
  },
  {
    name: "expirationDate",
    message: "Enter expiration date (YYYY-MM-DD):",
    type: "input",
    validate: (input: string) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(input)) {
        return "Please enter date in YYYY-MM-DD format";
      }
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        return "Please enter a valid date";
      }
      if (date < new Date()) {
        return "Expiration date must be in the future";
      }
      return true;
    },
  },
];

/**
 * License revocation prompts
 */
export interface RevokeAnswers extends Answers {
  reason: string;
}

export const revokePrompts: QuestionCollection<RevokeAnswers> = [
  {
    name: "reason",
    message: "Enter reason for revocation:",
    type: "input",
    validate: (input: string) =>
      input.length > 0 || "Revocation reason is required",
  },
];

/**
 * Generic prompt wrapper
 */
export async function prompt<T extends Answers>(
  questions: QuestionCollection<T>
): Promise<T> {
  return inquirer.prompt<T>(questions);
}

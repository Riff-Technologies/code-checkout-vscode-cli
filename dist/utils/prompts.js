"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = exports.revokePrompts = exports.licensePrompts = exports.pricingPrompts = exports.confirmationPrompt = exports.loginPrompts = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const fs_1 = require("fs");
const path_1 = require("path");
function getDefaultPublisher() {
    try {
        const packageJsonPath = (0, path_1.join)(process.cwd(), "package.json");
        const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, "utf-8"));
        return packageJson.publisher || "";
    }
    catch {
        return "";
    }
}
exports.loginPrompts = [
    {
        name: "email",
        message: "Enter your email:",
        type: "input",
        validate: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) || "Please enter a valid email address";
        },
    },
    {
        name: "password",
        message: "Enter your password:",
        type: "password",
        validate: (input) => input.length >= 8 || "Password must be at least 8 characters long",
    },
    {
        name: "givenName",
        message: "Enter your first name:",
        type: "input",
        validate: (input) => input.length > 0 || "First name is required",
    },
    {
        name: "familyName",
        message: "Enter your last name:",
        type: "input",
        validate: (input) => input.length > 0 || "Last name is required",
    },
    {
        name: "company",
        message: "Enter your company name (optional):",
        type: "input",
    },
    {
        name: "publisher",
        message: "Enter your publisher ID:",
        type: "input",
        default: getDefaultPublisher,
        validate: (input) => input.length > 0 || "Publisher ID is required",
    },
];
exports.confirmationPrompt = [
    {
        name: "confirmationCode",
        message: "Enter the confirmation code from your email:",
        type: "input",
        validate: (input) => (input.length === 6 && /^\d+$/.test(input)) ||
            "Please enter a valid 6-digit confirmation code",
    },
];
exports.pricingPrompts = [
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
        when: (answers) => answers.price === "custom",
        validate: (input) => {
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
];
exports.licensePrompts = [
    {
        name: "maxMachines",
        message: "Enter maximum number of machines:",
        type: "number",
        validate: (input) => {
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
        validate: (input) => {
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
exports.revokePrompts = [
    {
        name: "reason",
        message: "Enter reason for revocation:",
        type: "input",
        validate: (input) => input.length > 0 || "Revocation reason is required",
    },
];
/**
 * Generic prompt wrapper
 */
async function prompt(questions) {
    return inquirer_1.default.prompt(questions);
}
exports.prompt = prompt;

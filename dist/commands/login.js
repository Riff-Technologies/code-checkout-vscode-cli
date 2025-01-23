"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const prompts_1 = require("../utils/prompts");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class Login extends core_1.Command {
    async run() {
        try {
            this.log("Welcome to Code Checkout! Let's get you logged in.");
            // Step 1: Collect user information and register
            const answers = await (0, prompts_1.prompt)(prompts_1.loginPrompts);
            this.log("Creating your account...");
            await (0, api_1.registerUser)({
                username: answers.email,
                email: answers.email,
                password: answers.password,
                givenName: answers.givenName,
                familyName: answers.familyName,
                company: answers.company,
                publisher: answers.publisher || "",
            });
            this.log("✅ Account created! Check your email for a confirmation code.");
            // Step 2: Get confirmation code and confirm account
            const confirmation = await (0, prompts_1.prompt)(prompts_1.confirmationPrompt);
            this.log("Confirming your account...");
            const response = await (0, api_1.confirmUser)({
                username: answers.email,
                confirmationCode: confirmation.confirmationCode || "",
            });
            // Step 3: Save configuration
            await (0, config_1.saveConfig)({
                publisherId: response.publisherId,
                jwt: response.jwt,
                username: response.username,
            });
            this.log("✅ Successfully logged in!");
            this.log(`Your Publisher ID is: ${response.publisherId}`);
            this.log("\nNext steps:");
            this.log("1. Link your Stripe account: code-checkout link-stripe");
            this.log("2. Create your software: code-checkout create-software");
        }
        catch (error) {
            this.handleError(error);
        }
    }
    handleError(error) {
        this.error(`❌ Authentication failed: ${error.message}
Try again or contact support if the problem persists.`);
    }
}
Login.description = "Log in or create an account on the Code Checkout platform";
Login.examples = ["$ code-checkout login"];
exports.default = Login;

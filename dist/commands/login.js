"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const prompts_1 = require("../utils/prompts");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class Login extends core_1.Command {
    async run() {
        try {
            this.log("Welcome to Code Checkout!");
            // Check if user is already registered
            const config = (0, config_1.getConfig)();
            if (config.username) {
                // Existing user - just ask for password
                this.log(`Logging in as ${config.username}...`);
                const answers = await (0, prompts_1.prompt)([
                    {
                        name: "password",
                        message: "Enter your password:",
                        type: "password",
                        validate: (input) => input.length >= 8 ||
                            "Password must be at least 8 characters long",
                    },
                ]);
                // Login with existing username
                const loginResponse = await (0, api_1.loginUser)({
                    username: config.username,
                    password: answers.password,
                });
                if (!loginResponse.tokens?.idToken) {
                    throw new Error("Invalid response from server: missing authentication tokens");
                }
                // Extract publisher ID from the ID token
                const idToken = loginResponse.tokens.idToken;
                const tokenParts = idToken.split(".");
                if (tokenParts.length !== 3) {
                    throw new Error("Invalid ID token format");
                }
                try {
                    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
                    const publisherId = payload["custom:publisherId"];
                    if (!publisherId) {
                        throw new Error("Publisher ID not found in token");
                    }
                    // Save the configuration with the login tokens
                    await (0, config_1.saveConfig)({
                        publisherId,
                        jwt: idToken,
                        username: config.username,
                    });
                    this.log("✅ Successfully logged in!");
                    this.log(`Your Publisher ID is: ${publisherId}`);
                    this.log("\nNext steps:");
                    this.log("1. Link your Stripe account: code-checkout link-stripe");
                    this.log("2. Create your software: code-checkout create-software");
                }
                catch (error) {
                    throw new Error("Failed to extract publisher ID from token. Please contact support.");
                }
            }
            else {
                // New user - collect all information and register
                this.log("Let's create your account!");
                const answers = await (0, prompts_1.prompt)(prompts_1.loginPrompts);
                const { email: username, password } = answers;
                this.log("Creating your account...");
                // Register the user
                await (0, api_1.registerUser)({
                    username,
                    email: username,
                    password,
                    givenName: answers.givenName,
                    familyName: answers.familyName,
                    company: answers.company,
                    publisher: answers.publisher || "",
                });
                this.log("✅ Account created! Check your email for a confirmation code.");
                // Step 2: Get confirmation code and retry if invalid
                let confirmationAttempts = 0;
                const maxAttempts = 3;
                while (confirmationAttempts < maxAttempts) {
                    const confirmation = await (0, prompts_1.prompt)(prompts_1.confirmationPrompt);
                    this.log("Confirming your account...");
                    try {
                        // Confirm the account
                        await (0, api_1.confirmUser)({
                            username,
                            confirmationCode: confirmation.confirmationCode || "",
                        });
                        // If we get here, confirmation was successful
                        break;
                    }
                    catch (error) {
                        confirmationAttempts++;
                        if (confirmationAttempts === maxAttempts) {
                            throw new Error("Maximum confirmation attempts reached. Please start over and try again.");
                        }
                        this.log(`❌ Invalid confirmation code. ${maxAttempts - confirmationAttempts} attempts remaining.`);
                    }
                }
                // Step 3: Log in the user
                this.log("Logging in...");
                const loginResponse = await (0, api_1.loginUser)({ username, password });
                if (!loginResponse.tokens?.idToken) {
                    throw new Error("Invalid response from server: missing authentication tokens");
                }
                // Extract publisher ID from the ID token
                const idToken = loginResponse.tokens.idToken;
                const tokenParts = idToken.split(".");
                if (tokenParts.length !== 3) {
                    throw new Error("Invalid ID token format");
                }
                try {
                    const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
                    const publisherId = payload["custom:publisherId"];
                    if (!publisherId) {
                        throw new Error("Publisher ID not found in token");
                    }
                    // Save the configuration with the login tokens
                    await (0, config_1.saveConfig)({
                        publisherId,
                        jwt: idToken,
                        username,
                    });
                    this.log("✅ Successfully logged in!");
                    this.log(`Your Publisher ID is: ${publisherId}`);
                    this.log("\nNext steps:");
                    this.log("1. Link your Stripe account: code-checkout link-stripe");
                    this.log("2. Create your software: code-checkout create-software");
                }
                catch (error) {
                    throw new Error("Failed to extract publisher ID from token. Please contact support.");
                }
            }
        }
        catch (error) {
            this.error(`❌ Authentication failed: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
Login.description = "Log in or create an account on the Code Checkout platform";
Login.examples = ["$ code-checkout login"];
exports.default = Login;

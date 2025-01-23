"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const prompts_1 = require("../utils/prompts");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
const open_1 = __importDefault(require("open"));
const fs_1 = require("fs");
const path_1 = require("path");
const child_process_1 = require("child_process");
class Init extends core_1.Command {
    async run() {
        try {
            this.log("Welcome to Code Checkout! Let's get your project set up. 🚀\n");
            // Step 1: Login
            if (!(0, config_1.isAuthenticated)()) {
                this.log("Step 1: Authentication");
                await this.handleLogin();
            }
            // Step 2: Link Stripe
            this.log("\nStep 2: Stripe Integration");
            await this.handleStripeLink();
            // Step 3: Create Software
            if (!(0, config_1.hasSoftware)()) {
                this.log("\nStep 3: Software Registration");
                await this.handleSoftwareCreation();
            }
            // Step 4: Create Pricing
            this.log("\nStep 4: Pricing Setup");
            await this.handlePricingCreation();
            // Step 5: Run Init Script
            this.log("\nStep 5: Project Initialization");
            await this.handleInitScript();
            this.log("\n✨ All done! Your project is now set up with Code Checkout!");
            this.log("\nWhat's next?");
            this.log("1. Commit the changes to your repository");
            this.log("2. Push your changes");
            this.log("3. Start using Code Checkout in your project");
        }
        catch (error) {
            this.error(`❌ Setup failed: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
    async handleLogin() {
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
        // Get confirmation code and retry if invalid
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
        // Log in the user
        this.log("Logging in...");
        const loginResponse = await (0, api_1.loginUser)({ username, password });
        if (!loginResponse.tokens?.idToken) {
            throw new Error("Invalid response from server: missing authentication tokens. Please contact support.");
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
            // Verify the config was saved
            const config = (0, config_1.getConfig)();
            if (!config.publisherId || !config.jwt) {
                throw new Error("Failed to save authentication data. Please check file permissions.");
            }
            this.log("✅ Successfully logged in!");
        }
        catch (error) {
            throw new Error("Failed to extract publisher ID from token. Please contact support.");
        }
    }
    async handleStripeLink() {
        this.log("Generating Stripe onboarding link...");
        const stripeUrl = await (0, api_1.getStripeLink)();
        // Prompt user before opening URL
        const { shouldOpen } = await (0, prompts_1.prompt)({
            type: "confirm",
            name: "shouldOpen",
            message: "Press Enter to open the Stripe onboarding page in your default browser",
            default: true,
        });
        if (shouldOpen) {
            this.log("✅ Opening Stripe onboarding in your default browser...");
            await (0, open_1.default)(stripeUrl);
        }
        else {
            this.log(`\nStripe onboarding URL: ${stripeUrl}`);
            this.log("Please open this URL in your browser to complete the Stripe onboarding process.");
        }
        // Wait for user to complete Stripe setup
        await (0, prompts_1.prompt)({
            type: "confirm",
            name: "stripeComplete",
            message: "Have you completed the Stripe onboarding process?",
            default: false,
        });
    }
    async handleSoftwareCreation() {
        this.log("Reading package.json...");
        const packageJson = this.readPackageJson();
        const { publisherId } = (0, config_1.getConfig)();
        if (!publisherId) {
            throw new Error("Publisher ID not found. Please start over.");
        }
        this.log("Creating software record...");
        const software = await (0, api_1.createSoftware)(publisherId, packageJson.name, packageJson.version);
        await (0, config_1.saveConfig)({
            softwareId: software.id,
            extensionId: packageJson.name,
            publisher: packageJson.publisher,
        });
        this.log("✅ Software record created!");
        this.log(`Software ID: ${software.id}`);
    }
    async handlePricingCreation() {
        const { publisherId, softwareId } = (0, config_1.getConfig)();
        if (!publisherId || !softwareId) {
            throw new Error("Missing configuration. Please start over.");
        }
        const answers = await (0, prompts_1.prompt)(prompts_1.pricingPrompts);
        const price = answers.price === "custom"
            ? parseFloat(answers.customPrice || "0")
            : parseFloat(answers.price);
        this.log("Creating pricing...");
        await (0, api_1.createPricing)(publisherId, softwareId, answers.model, price);
        this.log("✅ Pricing created!");
        this.log(`Model: ${answers.model}`);
        this.log(`Price: $${price.toFixed(2)}`);
    }
    async handleInitScript() {
        this.log("Running initialization script...");
        try {
            (0, child_process_1.execSync)("npx code-checkout-init", {
                stdio: "inherit",
                encoding: "utf-8",
            });
            this.log("✅ Initialization complete!");
        }
        catch (error) {
            throw new Error(`Failed to run initialization script: ${error.message}`);
        }
    }
    readPackageJson() {
        try {
            const packageJsonPath = (0, path_1.join)(process.cwd(), "package.json");
            const packageJsonContent = (0, fs_1.readFileSync)(packageJsonPath, "utf-8");
            const packageJson = JSON.parse(packageJsonContent);
            // Validate required fields
            if (!packageJson.name) {
                throw new Error("package.json must contain a name field");
            }
            if (!packageJson.publisher) {
                throw new Error("package.json must contain a publisher field");
            }
            return packageJson;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes("must contain")) {
                throw error;
            }
            throw new Error("Could not read package.json. Make sure you're in the root directory of your project.");
        }
    }
}
Init.description = "Interactive setup for Code Checkout";
Init.examples = ["$ code-checkout", "$ code-checkout init"];
// Make this the default command
Init.aliases = [""];
exports.default = Init;

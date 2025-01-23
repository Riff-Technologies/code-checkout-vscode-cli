"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const prompts_1 = require("../utils/prompts");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class CreatePricing extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to create pricing.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { publisherId, softwareId } = (0, config_1.getConfig)();
            if (!publisherId || !softwareId) {
                this.error("❌ Publisher ID or Software ID not found. Please log in and create software again.");
            }
            this.log("Let's set up pricing for your software...");
            const answers = await (0, prompts_1.prompt)(prompts_1.pricingPrompts);
            const price = answers.price === "custom"
                ? parseFloat(answers.customPrice || "0")
                : parseFloat(answers.price);
            this.log("Creating pricing...");
            await (0, api_1.createPricing)(publisherId, softwareId, answers.model, price);
            this.log("✅ Pricing created successfully!");
            this.log(`Model: ${answers.model}`);
            this.log(`Price: $${price.toFixed(2)}`);
            this.log("\nNext step:");
            this.log("Run initialization script: code-checkout run-script");
        }
        catch (error) {
            this.handleError(error);
        }
    }
    handleError(error) {
        this.error(`❌ Failed to create pricing: ${error.message}
Try again or contact support if the problem persists.`);
    }
}
CreatePricing.description = "Create or updatepricing for your software";
CreatePricing.examples = ["$ code-checkout create-pricing"];
exports.default = CreatePricing;

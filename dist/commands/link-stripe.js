"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
const prompts_1 = require("../utils/prompts");
const open_1 = __importDefault(require("open"));
class LinkStripe extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to link your Stripe account.\nRun: code-checkout login");
            }
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
            this.log("\nNext step:");
            this.log("Create your software: code-checkout create-software");
        }
        catch (error) {
            this.handleError(error);
        }
    }
    handleError(error) {
        this.error(`❌ Failed to link Stripe account: ${error.message}
Try again or contact support if the problem persists.`);
    }
}
LinkStripe.description = "Link your Stripe account with Code Checkout";
LinkStripe.examples = ["$ code-checkout link-stripe"];
exports.default = LinkStripe;

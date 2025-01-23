"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class SoftwarePricing extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to view pricing.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { publisherId, softwareId } = (0, config_1.getConfig)();
            if (!publisherId || !softwareId) {
                this.error("❌ Publisher ID or Software ID not found. Please log in and create software again.");
            }
            this.log("Fetching pricing details...");
            const pricing = await (0, api_1.getSoftwarePricing)(publisherId, softwareId);
            this.log("\nPricing Details:");
            this.log("-------------------");
            this.log(`Model: ${pricing.model}`);
            this.log(`Price: $${pricing.price.toFixed(2)} ${pricing.currency}`);
            if (pricing.billingCycle) {
                this.log(`Billing Cycle: ${pricing.billingCycle}`);
            }
            if (pricing.freeTrialDays) {
                this.log(`Free Trial: ${pricing.freeTrialDays} days`);
            }
            if (pricing.metadata?.discount) {
                this.log(`Discount: ${pricing.metadata.discount}`);
            }
        }
        catch (error) {
            this.error(`❌ Failed to fetch pricing: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
SoftwarePricing.description = "Get pricing details for your software";
SoftwarePricing.examples = ["$ code-checkout software:pricing"];
exports.default = SoftwarePricing;

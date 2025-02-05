import { Command } from "@oclif/core";
import { getSoftwarePricing } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class SoftwarePricing extends Command {
  static description = "Get pricing details for your software";

  static examples = ["$ code-checkout software-pricing"];

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to view pricing.\nRun: code-checkout login"
        );
      }

      if (!hasSoftware()) {
        this.error(
          "❌ You must create software first.\nRun: code-checkout create-software"
        );
      }

      const { publisherId, softwareId } = getConfig();

      if (!publisherId || !softwareId) {
        this.error(
          "❌ Publisher ID or Software ID not found. Please log in and create software again."
        );
      }

      this.log("Fetching pricing details...");
      const pricing = await getSoftwarePricing(publisherId, softwareId);

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
    } catch (error) {
      this.error(`❌ Failed to fetch pricing: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }
}

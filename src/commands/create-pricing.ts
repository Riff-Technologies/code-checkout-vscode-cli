import { Command } from "@oclif/core";
import { prompt, pricingPrompts, PricingAnswers } from "../utils/prompts";
import { createPricing } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class CreatePricing extends Command {
  static description = "Create or update pricing for your software";

  static examples = ["$ code-checkout create-pricing"];

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to create pricing.\nRun: code-checkout login"
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

      this.log("Let's set up pricing for your software...");
      const answers = await prompt<PricingAnswers>(pricingPrompts);

      const price =
        answers.price === "custom"
          ? parseFloat(answers.customPrice || "0")
          : parseFloat(answers.price);

      this.log("Creating pricing...");
      await createPricing(
        publisherId,
        softwareId,
        answers.model,
        price,
        answers.freeTrialDays
      );

      this.log("✅ Pricing created successfully!");
      this.log(`Model: ${answers.model}`);
      this.log(`Price: $${price.toFixed(2)}`);
      if (answers.model === "subscription" && answers.freeTrialDays) {
        this.log(`Free Trial: ${answers.freeTrialDays} days`);
      }

      this.log("\nNext step:");
      this.log("Run initialization script: code-checkout run-script");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error): never {
    this.error(`❌ Failed to create pricing: ${error.message}
Try again or contact support if the problem persists.`);
  }
}

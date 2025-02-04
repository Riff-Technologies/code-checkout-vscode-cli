import { Command } from "@oclif/core";
import { getStripeLink } from "../utils/api";
import { isAuthenticated, getConfig, saveConfig } from "../utils/config";
import { prompt } from "../utils/prompts";
import open from "open";

export default class LinkStripe extends Command {
  static description = "Link your Stripe account with Code Checkout";

  static examples = ["$ code-checkout link-stripe"];

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to link your Stripe account.\nRun: code-checkout login"
        );
      }

      // Check if Stripe is already integrated
      const config = getConfig();
      if (config.stripeIntegrated) {
        this.log("✅ Stripe is already integrated!");
        return;
      }

      this.log("Generating Stripe onboarding link...");
      const stripeUrl = await getStripeLink();

      // Prompt user before opening URL
      const { shouldOpen } = await prompt<{ shouldOpen: boolean }>({
        type: "confirm",
        name: "shouldOpen",
        message:
          "Press Enter to open the Stripe onboarding page in your default browser",
        default: true,
      });

      if (shouldOpen) {
        this.log("✅ Opening Stripe onboarding in your default browser...");
        await open(stripeUrl);
      } else {
        this.log(`\nStripe onboarding URL: ${stripeUrl}`);
        this.log(
          "Please open this URL in your browser to complete the Stripe onboarding process."
        );
      }

      // Wait for user to complete Stripe setup
      const { stripeComplete } = await prompt<{ stripeComplete: boolean }>({
        type: "confirm",
        name: "stripeComplete",
        message: "Have you completed the Stripe onboarding process?",
        default: false,
      });

      if (stripeComplete) {
        await saveConfig({ stripeIntegrated: true });
        this.log("✅ Stripe integration completed!");
      } else {
        this.log(
          "\n⚠️  Please complete the Stripe onboarding process before proceeding."
        );
        this.log(
          "You can run this command again once you've completed the process."
        );
        return;
      }

      this.log("\nNext step:");
      this.log("Create your software: code-checkout create-software");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error): never {
    this.error(`❌ Failed to link Stripe account: ${error.message}
Try again or contact support if the problem persists.`);
  }
}

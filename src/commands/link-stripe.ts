import { Command } from "@oclif/core";
import { getStripeLink } from "../utils/api";
import { isAuthenticated } from "../utils/config";
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

      this.log("Generating Stripe onboarding link...");
      const stripeUrl = await getStripeLink();

      this.log("✅ Opening Stripe onboarding in your default browser...");
      await open(stripeUrl);

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

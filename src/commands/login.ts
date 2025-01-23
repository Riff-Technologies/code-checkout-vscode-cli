import { Command } from "@oclif/core";
import {
  prompt,
  loginPrompts,
  confirmationPrompt,
  LoginAnswers,
} from "../utils/prompts";
import { registerUser, confirmUser } from "../utils/api";
import { saveConfig } from "../utils/config";

export default class Login extends Command {
  static description =
    "Log in or create an account on the Code Checkout platform";
  static examples = ["$ code-checkout login"];

  async run(): Promise<void> {
    try {
      this.log("Welcome to Code Checkout! Let's get you logged in.");

      // Step 1: Collect user information and register
      const answers = await prompt<LoginAnswers>(loginPrompts);
      this.log("Creating your account...");

      await registerUser({
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
      const confirmation = await prompt<LoginAnswers>(confirmationPrompt);
      this.log("Confirming your account...");

      const response = await confirmUser({
        username: answers.email,
        confirmationCode: confirmation.confirmationCode || "",
      });

      // Step 3: Save configuration
      await saveConfig({
        publisherId: response.publisherId,
        jwt: response.jwt,
        username: response.username,
      });

      this.log("✅ Successfully logged in!");
      this.log(`Your Publisher ID is: ${response.publisherId}`);
      this.log("\nNext steps:");
      this.log("1. Link your Stripe account: code-checkout link-stripe");
      this.log("2. Create your software: code-checkout create-software");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error): never {
    this.error(`❌ Authentication failed: ${error.message}
Try again or contact support if the problem persists.`);
  }
}

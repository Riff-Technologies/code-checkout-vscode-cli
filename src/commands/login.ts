import { Command } from "@oclif/core";
import {
  prompt,
  loginPrompts,
  confirmationPrompt,
  LoginAnswers,
} from "../utils/prompts";
import { registerUser, confirmUser, loginUser } from "../utils/api";
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
      const { email: username, password } = answers;
      this.log("Creating your account...");

      // Register the user
      await registerUser({
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
        const confirmation = await prompt<LoginAnswers>(confirmationPrompt);
        this.log("Confirming your account...");

        try {
          // Confirm the account
          await confirmUser({
            username,
            confirmationCode: confirmation.confirmationCode || "",
          });

          // If we get here, confirmation was successful
          break;
        } catch (error) {
          confirmationAttempts++;
          if (confirmationAttempts === maxAttempts) {
            throw new Error(
              "Maximum confirmation attempts reached. Please start over and try again."
            );
          }
          this.log(
            `❌ Invalid confirmation code. ${
              maxAttempts - confirmationAttempts
            } attempts remaining.`
          );
        }
      }

      // Step 3: Log in the user
      this.log("Logging in...");
      const loginResponse = await loginUser({ username, password });

      if (!loginResponse.tokens?.idToken) {
        throw new Error(
          "Invalid response from server: missing authentication tokens. Please contact support."
        );
      }

      // Extract publisher ID from the ID token
      const idToken = loginResponse.tokens.idToken;
      const tokenParts = idToken.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid ID token format");
      }

      try {
        const payload = JSON.parse(
          Buffer.from(tokenParts[1], "base64").toString()
        );
        const publisherId = payload["custom:publisherId"];

        if (!publisherId) {
          throw new Error("Publisher ID not found in token");
        }

        // Save the configuration with the login tokens
        await saveConfig({
          publisherId,
          jwt: idToken,
          username,
        });

        this.log("✅ Successfully logged in!");
        this.log(`Your Publisher ID is: ${publisherId}`);
        this.log("\nNext steps:");
        this.log("1. Link your Stripe account: code-checkout link-stripe");
        this.log("2. Create your software: code-checkout create-software");
      } catch (error) {
        throw new Error(
          "Failed to extract publisher ID from token. Please contact support."
        );
      }
    } catch (error) {
      this.error(`❌ Authentication failed: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }
}

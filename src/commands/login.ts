import { Command } from "@oclif/core";
import {
  prompt,
  loginPrompts,
  confirmationPrompt,
  LoginAnswers,
} from "../utils/prompts";
import { registerUser, confirmUser, loginUser } from "../utils/api";
import { getConfig, saveConfig } from "../utils/config";
import { updatePackageJsonPublisher } from "../utils/package";

export default class Login extends Command {
  static description =
    "Log in or create an account on the Code Checkout platform";
  static examples = ["$ code-checkout login"];

  async run(): Promise<void> {
    try {
      this.log("Welcome to Code Checkout!");

      // Check if user is already registered
      const config = getConfig();
      if (config.username) {
        // Existing user - just ask for password
        this.log(`Logging in as ${config.username}...`);
        const answers = await prompt<LoginAnswers>([
          {
            name: "password",
            message: "Enter your password:",
            type: "password",
            validate: (input: string) =>
              input.length >= 8 ||
              "Password must be at least 8 characters long",
          },
        ]);

        // Login with existing username
        const loginResponse = await loginUser({
          username: config.username,
          password: answers.password,
        });

        if (!loginResponse.tokens?.idToken) {
          throw new Error(
            "Invalid response from server: missing authentication tokens"
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
            username: config.username,
          });

          this.log("✅ Successfully logged in!");

          // Show relevant next steps based on configuration
          const currentConfig = getConfig();
          const nextSteps: string[] = [];

          if (!currentConfig.stripeIntegrated) {
            nextSteps.push(
              "1. Link your Stripe account: code-checkout link-stripe"
            );
          }

          if (!currentConfig.softwareId) {
            nextSteps.push(
              `${
                nextSteps.length + 1
              }. Create your software: code-checkout create-software`
            );
          }

          if (nextSteps.length > 0) {
            this.log("\nNext steps:");
            nextSteps.forEach((step) => this.log(step));
          }
        } catch (error) {
          throw new Error(
            "Failed to extract publisher ID from token. Please contact support."
          );
        }
      } else {
        // New user - collect all information and register
        this.log("Let's create your account!");
        const answers = await prompt<LoginAnswers>(loginPrompts);
        const { email: username, password } = answers;
        this.log("Creating your account...");

        // Update package.json with publisher if provided
        if (answers.publisher) {
          updatePackageJsonPublisher(answers.publisher, {
            log: this.log.bind(this),
          });
        }

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

        this.log(
          "✅ Account created! Check your email for a confirmation code."
        );

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
            "Invalid response from server: missing authentication tokens"
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

          // Show relevant next steps based on configuration
          const currentConfig = getConfig();
          const nextSteps: string[] = [];

          if (!currentConfig.stripeIntegrated) {
            nextSteps.push(
              "1. Link your Stripe account: code-checkout link-stripe"
            );
          }

          if (!currentConfig.softwareId) {
            nextSteps.push(
              `${
                nextSteps.length + 1
              }. Create your software: code-checkout create-software`
            );
          }

          if (nextSteps.length > 0) {
            this.log("\nNext steps:");
            nextSteps.forEach((step) => this.log(step));
          }
        } catch (error) {
          throw new Error(
            "Failed to extract publisher ID from token. Please contact support."
          );
        }
      }
    } catch (error) {
      this.error(`❌ Authentication failed: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }
}

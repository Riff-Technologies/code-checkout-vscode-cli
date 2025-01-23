import { Command } from "@oclif/core";
import {
  prompt,
  loginPrompts,
  pricingPrompts,
  confirmationPrompt,
} from "../utils/prompts";
import {
  registerUser,
  confirmUser,
  getStripeLink,
  createSoftware,
  createPricing,
  loginUser,
} from "../utils/api";
import {
  getConfig,
  saveConfig,
  isAuthenticated,
  hasSoftware,
} from "../utils/config";
import open from "open";
import { readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { LoginAnswers, PricingAnswers } from "../utils/prompts";

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

export default class Init extends Command {
  static description = "Interactive setup for Code Checkout";
  static examples = ["$ code-checkout", "$ code-checkout init"];

  // Make this the default command
  static aliases = [""];

  async run(): Promise<void> {
    try {
      this.log("Welcome to Code Checkout! Let's get your project set up. 🚀\n");

      // Step 1: Login
      if (!isAuthenticated()) {
        this.log("Step 1: Authentication");
        await this.handleLogin();
      }

      // Step 2: Link Stripe
      this.log("\nStep 2: Stripe Integration");
      await this.handleStripeLink();

      // Step 3: Create Software
      if (!hasSoftware()) {
        this.log("\nStep 3: Software Registration");
        await this.handleSoftwareCreation();
      }

      // Step 4: Create Pricing
      this.log("\nStep 4: Pricing Setup");
      await this.handlePricingCreation();

      // Step 5: Run Init Script
      this.log("\nStep 5: Project Initialization");
      await this.handleInitScript();

      this.log("\n✨ All done! Your project is now set up with Code Checkout!");
      this.log("\nWhat's next?");
      this.log("1. Commit the changes to your repository");
      this.log("2. Push your changes");
      this.log("3. Start using Code Checkout in your project");
    } catch (error) {
      this.error(`❌ Setup failed: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }

  private async handleLogin(): Promise<void> {
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

    // Get confirmation code and retry if invalid
    let confirmationAttempts = 0;
    const maxAttempts = 3;
    let confirmResponse;

    while (confirmationAttempts < maxAttempts) {
      const confirmation = await prompt<LoginAnswers>(confirmationPrompt);
      this.log("Confirming your account...");

      try {
        // Confirm the account
        confirmResponse = await confirmUser({
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

    if (!confirmResponse?.publisherId || !confirmResponse?.jwt) {
      throw new Error(
        "Invalid response from server: missing authentication data. Please contact support."
      );
    }

    // Log in the user
    this.log("Logging in...");
    const loginResponse = await loginUser({ username, password });

    // Save the configuration with the login tokens
    await saveConfig({
      publisherId: confirmResponse.publisherId,
      jwt: loginResponse.tokens.idToken, // Use the ID token as the JWT
      username: confirmResponse.username,
    });

    // Verify the config was saved
    const config = getConfig();
    if (!config.publisherId || !config.jwt) {
      throw new Error(
        "Failed to save authentication data. Please check file permissions."
      );
    }

    this.log("✅ Successfully logged in!");
  }

  private async handleStripeLink(): Promise<void> {
    this.log("Generating Stripe onboarding link...");
    const stripeUrl = await getStripeLink();
    this.log("✅ Opening Stripe onboarding in your default browser...");
    await open(stripeUrl);

    // Wait for user to complete Stripe setup
    await prompt({
      type: "confirm",
      name: "stripeComplete",
      message: "Have you completed the Stripe onboarding process?",
      default: false,
    });
  }

  private async handleSoftwareCreation(): Promise<void> {
    this.log("Reading package.json...");
    const packageJson = this.readPackageJson();
    const { publisherId } = getConfig();

    if (!publisherId) {
      throw new Error("Publisher ID not found. Please start over.");
    }

    this.log("Creating software record...");
    const software = await createSoftware(
      publisherId,
      packageJson.name,
      packageJson.version
    );

    await saveConfig({ softwareId: software.id });
    this.log("✅ Software record created!");
    this.log(`Software ID: ${software.id}`);
  }

  private async handlePricingCreation(): Promise<void> {
    const { publisherId, softwareId } = getConfig();
    if (!publisherId || !softwareId) {
      throw new Error("Missing configuration. Please start over.");
    }

    const answers = await prompt<PricingAnswers>(pricingPrompts);
    const price =
      answers.price === "custom"
        ? parseFloat(answers.customPrice || "0")
        : parseFloat(answers.price);

    this.log("Creating pricing...");
    await createPricing(publisherId, softwareId, answers.model, price);
    this.log("✅ Pricing created!");
    this.log(`Model: ${answers.model}`);
    this.log(`Price: $${price.toFixed(2)}`);
  }

  private async handleInitScript(): Promise<void> {
    this.log("Running initialization script...");
    try {
      execSync("npx code-checkout-init", {
        stdio: "inherit",
        encoding: "utf-8",
      });
      this.log("✅ Initialization complete!");
    } catch (error) {
      throw new Error(
        `Failed to run initialization script: ${(error as Error).message}`
      );
    }
  }

  private readPackageJson(): PackageJson {
    try {
      const packageJsonPath = join(process.cwd(), "package.json");
      const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
      return JSON.parse(packageJsonContent);
    } catch (error) {
      throw new Error(
        "Could not read package.json. Make sure you're in the root directory of your project."
      );
    }
  }
}

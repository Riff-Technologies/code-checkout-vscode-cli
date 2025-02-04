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
import { existsSync } from "fs";

interface PackageJson {
  name: string;
  version: string;
  description?: string;
  publisher: string;
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

    // Log in the user
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

      // Verify the config was saved
      const config = getConfig();
      if (!config.publisherId || !config.jwt) {
        throw new Error(
          "Failed to save authentication data. Please check file permissions."
        );
      }

      this.log("✅ Successfully logged in!");
    } catch (error) {
      throw new Error(
        "Failed to extract publisher ID from token. Please contact support."
      );
    }
  }

  private async handleStripeLink(): Promise<void> {
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
      throw new Error("Stripe integration must be completed to proceed.");
    }
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

    await saveConfig({
      softwareId: software.id,
      extensionId: packageJson.name,
      publisher: packageJson.publisher,
    });
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
    await createPricing(
      publisherId,
      softwareId,
      answers.model,
      price,
      answers.freeTrialDays
    );

    this.log("✅ Pricing created!");
    this.log(`Model: ${answers.model}`);
    this.log(`Price: $${price.toFixed(2)}`);
    if (answers.model === "subscription" && answers.freeTrialDays) {
      this.log(`Free Trial: ${answers.freeTrialDays} days`);
    }
  }

  private getPackageManager(): {
    name: "npm" | "yarn" | "pnpm" | null;
    command: string;
  } {
    try {
      // Check for lock files in order of preference
      if (existsSync(join(process.cwd(), "package-lock.json"))) {
        return { name: "npm", command: "npm install code-checkout" };
      }
      if (existsSync(join(process.cwd(), "yarn.lock"))) {
        return { name: "yarn", command: "yarn add code-checkout" };
      }
      if (existsSync(join(process.cwd(), "pnpm-lock.yaml"))) {
        return { name: "pnpm", command: "pnpm add code-checkout" };
      }
      return { name: null, command: "" };
    } catch {
      return { name: null, command: "" };
    }
  }

  private async handleInitScript(): Promise<void> {
    this.log("Checking for code-checkout package...");

    // Check if code-checkout is installed
    let isInstalled = false;
    try {
      require.resolve("code-checkout");
      isInstalled = true;
    } catch {
      isInstalled = false;
    }

    if (!isInstalled) {
      const { shouldInstall } = await prompt<{ shouldInstall: boolean }>({
        type: "confirm",
        name: "shouldInstall",
        message:
          "The code-checkout package is required but not installed. Would you like to install it?",
        default: true,
      });

      if (!shouldInstall) {
        this.log(
          "⚠️ Initialization skipped - code-checkout package is required for initialization."
        );
        return;
      }

      const packageManager = this.getPackageManager();

      if (packageManager.name) {
        this.log(
          `Installing code-checkout package using ${packageManager.name}...`
        );
        try {
          execSync(packageManager.command, {
            stdio: "inherit",
            encoding: "utf-8",
          });
          this.log("✅ code-checkout package installed successfully!");
        } catch (error) {
          throw new Error(
            `Failed to install code-checkout package: ${
              (error as Error).message
            }`
          );
        }
      } else {
        this.log(
          "\n⚠️ Could not determine your package manager. Please install the package manually:"
        );
        this.log("\nUsing npm:");
        this.log("  npm install code-checkout");
        this.log("\nUsing yarn:");
        this.log("  yarn add code-checkout");
        this.log("\nUsing pnpm:");
        this.log("  pnpm add code-checkout");
        this.log("\nAfter installing, run 'code-checkout init' again.");
        return;
      }
    }

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
      const packageJson = JSON.parse(packageJsonContent);

      // Validate required fields
      if (!packageJson.name) {
        throw new Error("package.json must contain a name field");
      }
      if (!packageJson.publisher) {
        throw new Error("package.json must contain a publisher field");
      }

      return packageJson;
    } catch (error) {
      if (error instanceof Error && error.message.includes("must contain")) {
        throw error;
      }
      throw new Error(
        "Could not read package.json. Make sure you're in the root directory of your project."
      );
    }
  }
}

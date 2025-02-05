import { Command } from "@oclif/core";
import { execSync } from "child_process";
import { isAuthenticated, hasSoftware } from "../utils/config";
import { getPackageManager } from "@/utils/package";

export default class RunScript extends Command {
  static description = "Run the initialization script in your project";

  static examples = ["$ code-checkout run-script"];

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to run the initialization script.\nRun: code-checkout login"
        );
      }

      if (!hasSoftware()) {
        this.error(
          "❌ You must create software first.\nRun: code-checkout create-software"
        );
      }

      this.log("Running initialization script...");
      this.runInitScript();

      this.log("✅ Initialization script completed successfully!");
      this.log("\nYour project is now set up with Code Checkout!");
      this.log("You can now:");
      this.log("1. Commit the changes to your repository");
      this.log("2. Push your changes");
      this.log("3. Start using Code Checkout in your project");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private runInitScript(): void {
    try {
      const packageManager = getPackageManager();
      const initCommand = packageManager.name
        ? packageManager.runScript
        : "npx code-checkout-init";

      execSync(initCommand, {
        stdio: "inherit",
        encoding: "utf-8",
      });
    } catch (error) {
      throw new Error(
        `Failed to run initialization script: ${(error as Error).message}`
      );
    }
  }

  private handleError(error: Error): never {
    this.error(`❌ ${error.message}
Try again or contact support if the problem persists.`);
  }
}

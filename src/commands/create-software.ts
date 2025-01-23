import { Command } from "@oclif/core";
import { readFileSync } from "fs";
import { join } from "path";
import { createSoftware } from "../utils/api";
import { getConfig, saveConfig, isAuthenticated } from "../utils/config";

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

export default class CreateSoftware extends Command {
  static description = "Create a software record from your package.json";

  static examples = ["$ code-checkout create-software"];

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to create software.\nRun: code-checkout login"
        );
      }

      this.log("Reading package.json...");
      const packageJson = this.readPackageJson();

      const { publisherId } = getConfig();
      if (!publisherId) {
        this.error("❌ Publisher ID not found. Please log in again.");
      }

      this.log("Creating software record...");
      const software = await createSoftware(
        publisherId,
        packageJson.name,
        packageJson.version
      );

      await saveConfig({ softwareId: software.id });

      this.log("✅ Software record created successfully!");
      this.log(`Software ID: ${software.id}`);
      this.log(`Name: ${software.name}`);
      this.log(`Version: ${software.version}`);
      this.log(`Extension ID: ${software.extensionId}`);

      this.log("\nNext step:");
      this.log("Create pricing: code-checkout create-pricing");
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private readPackageJson(): PackageJson {
    try {
      const packageJsonPath = join(process.cwd(), "package.json");
      const packageJsonContent = readFileSync(packageJsonPath, "utf-8");
      return JSON.parse(packageJsonContent);
    } catch (error) {
      this.error(
        "❌ Could not read package.json. Make sure you're in the root directory of your project."
      );
    }
  }

  private handleError(error: Error): never {
    this.error(`❌ Failed to create software: ${error.message}
Try again or contact support if the problem persists.`);
  }
}

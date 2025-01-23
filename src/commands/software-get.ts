import { Command } from "@oclif/core";
import { getSoftwareDetails } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class SoftwareGet extends Command {
  static description = "Get details about your software";

  static examples = ["$ code-checkout software:get"];

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to view software details.\nRun: code-checkout login"
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

      this.log("Fetching software details...");
      const software = await getSoftwareDetails(publisherId, softwareId);

      this.log("\nSoftware Details:");
      this.log("-------------------");
      this.log(`Name: ${software.name}`);
      this.log(`Version: ${software.version}`);
      this.log(`Status: ${software.status}`);
      this.log(`Extension ID: ${software.extensionId}`);
      this.log("\nMetadata:");
      this.log(`Category: ${software.metadata.category}`);
      this.log(`Platform: ${software.metadata.platform}`);
    } catch (error) {
      this.error(`❌ Failed to fetch software details: ${
        (error as Error).message
      }
Try again or contact support if the problem persists.`);
    }
  }
}

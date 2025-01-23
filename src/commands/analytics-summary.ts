import { Command, Flags } from "@oclif/core";
import { getAnalyticsSummary } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class AnalyticsSummary extends Command {
  static description = "Get analytics summary for your software";

  static examples = [
    "$ code-checkout analytics:summary",
    "$ code-checkout analytics:summary --startTime 2024-01-09 --endTime 2024-01-16",
  ];

  static flags = {
    startTime: Flags.string({
      char: "s",
      description: "Start time (YYYY-MM-DD)",
      required: false,
    }),
    endTime: Flags.string({
      char: "e",
      description: "End time (YYYY-MM-DD)",
      required: false,
    }),
  };

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to view analytics.\nRun: code-checkout login"
        );
      }

      if (!hasSoftware()) {
        this.error(
          "❌ You must create software first.\nRun: code-checkout create-software"
        );
      }

      const { flags } = await this.parse(AnalyticsSummary);

      this.log("Fetching analytics summary...");
      const summary = await getAnalyticsSummary({
        startTime: flags.startTime,
        endTime: flags.endTime,
      });

      this.log("\nAnalytics Summary:");
      this.log("-------------------");
      this.log(`Total Events: ${summary.totalEvents}`);

      this.log("\nCommand Usage:");
      Object.entries(summary.commandCounts).forEach(([command, count]) => {
        this.log(`${command}: ${count} times`);
      });

      this.log("\nLicense Status:");
      this.log(`Valid Licenses: ${summary.licenseStatusCounts.valid}`);
      this.log(`Invalid Licenses: ${summary.licenseStatusCounts.invalid}`);

      this.log("\nTime Range:");
      this.log(
        `From: ${new Date(summary.timeRange.start).toLocaleDateString()}`
      );
      this.log(`To: ${new Date(summary.timeRange.end).toLocaleDateString()}`);
    } catch (error) {
      this.error(`❌ Failed to fetch analytics summary: ${
        (error as Error).message
      }
Try again or contact support if the problem persists.`);
    }
  }
}

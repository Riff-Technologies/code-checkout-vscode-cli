import { Command, Flags } from "@oclif/core";
import { getAnalyticsEvents } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class AnalyticsEvents extends Command {
  static description = "Get analytics events for your software";

  static examples = [
    "$ code-checkout analytics-events",
    "$ code-checkout analytics-events --commandId my-command",
    "$ code-checkout analytics-events --startTime 2024-01-09 --endTime 2024-01-16",
  ];

  static flags = {
    commandId: Flags.string({
      char: "c",
      description: "Filter by command ID",
      required: false,
    }),
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

      const { flags } = await this.parse(AnalyticsEvents);

      this.log("Fetching analytics events...");
      const { events } = await getAnalyticsEvents({
        commandId: flags.commandId,
        startTime: flags.startTime,
        endTime: flags.endTime,
      });

      if (events.length === 0) {
        this.log("No events found.");
        return;
      }

      this.log("\nEvents:");
      events.forEach((event) => {
        this.log("\n-------------------");
        this.log(`Command ID: ${event.commandId}`);
        this.log(`Has Valid License: ${event.hasValidLicense}`);
        this.log(`Timestamp: ${new Date(event.timestamp).toLocaleString()}`);

        if (event.metadata?.category) {
          this.log(`Category: ${event.metadata.category}`);
        }

        if (event.metadata?.duration) {
          this.log(`Duration: ${event.metadata.duration}ms`);
        }
      });

      this.log("\n-------------------");
      this.log(`Total events shown: ${events.length}`);
    } catch (error) {
      this.error(`❌ Failed to fetch analytics events: ${
        (error as Error).message
      }
Try again or contact support if the problem persists.`);
    }
  }
}

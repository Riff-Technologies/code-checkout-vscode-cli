"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class AnalyticsSummary extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to view analytics.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { flags } = await this.parse(AnalyticsSummary);
            this.log("Fetching analytics summary...");
            const summary = await (0, api_1.getAnalyticsSummary)({
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
            this.log(`From: ${new Date(summary.timeRange.start).toLocaleDateString()}`);
            this.log(`To: ${new Date(summary.timeRange.end).toLocaleDateString()}`);
        }
        catch (error) {
            this.error(`❌ Failed to fetch analytics summary: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
AnalyticsSummary.description = "Get analytics summary for your software";
AnalyticsSummary.examples = [
    "$ code-checkout analytics:summary",
    "$ code-checkout analytics:summary --startTime 2024-01-09 --endTime 2024-01-16",
];
AnalyticsSummary.flags = {
    startTime: core_1.Flags.string({
        char: "s",
        description: "Start time (YYYY-MM-DD)",
        required: false,
    }),
    endTime: core_1.Flags.string({
        char: "e",
        description: "End time (YYYY-MM-DD)",
        required: false,
    }),
};
exports.default = AnalyticsSummary;

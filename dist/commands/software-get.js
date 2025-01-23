"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class SoftwareGet extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to view software details.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { publisherId, softwareId } = (0, config_1.getConfig)();
            if (!publisherId || !softwareId) {
                this.error("❌ Publisher ID or Software ID not found. Please log in and create software again.");
            }
            this.log("Fetching software details...");
            const software = await (0, api_1.getSoftwareDetails)(publisherId, softwareId);
            this.log("\nSoftware Details:");
            this.log("-------------------");
            this.log(`Name: ${software.name}`);
            this.log(`Version: ${software.version}`);
            this.log(`Status: ${software.status}`);
            this.log(`Extension ID: ${software.extensionId}`);
            this.log("\nMetadata:");
            this.log(`Category: ${software.metadata.category}`);
            this.log(`Platform: ${software.metadata.platform}`);
        }
        catch (error) {
            this.error(`❌ Failed to fetch software details: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
SoftwareGet.description = "Get details about your software";
SoftwareGet.examples = ["$ code-checkout software:get"];
exports.default = SoftwareGet;

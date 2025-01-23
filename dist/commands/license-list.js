"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class LicenseList extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to list licenses.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { flags } = await this.parse(LicenseList);
            const { publisherId, softwareId } = (0, config_1.getConfig)();
            if (!publisherId || !softwareId) {
                this.error("❌ Publisher ID or Software ID not found. Please log in and create software again.");
            }
            const status = flags.status;
            this.log("Fetching licenses...");
            const { licenses } = await (0, api_1.listLicenses)(publisherId, softwareId, {
                status: status === "all" ? undefined : status,
                limit: flags.limit,
                offset: flags.offset,
            });
            if (licenses.length === 0) {
                this.log("No licenses found.");
                return;
            }
            this.log("\nLicenses:");
            licenses.forEach((license) => {
                this.log("\n-------------------");
                this.log(`License Key: ${license.licenseKey}`);
                this.log(`Status: ${license.status}`);
                this.log(`Max Machines: ${license.maxMachines}`);
                this.log(`Expiration Date: ${new Date(license.expirationDate).toLocaleDateString()}`);
                if (license.metadata.customerId) {
                    this.log(`Customer ID: ${license.metadata.customerId}`);
                }
                if (license.metadata.revokedAt) {
                    this.log(`Revoked At: ${new Date(license.metadata.revokedAt).toLocaleDateString()}`);
                    this.log(`Revoke Reason: ${license.metadata.revokeReason}`);
                }
                this.log(`Created At: ${new Date(license.createdAt).toLocaleDateString()}`);
            });
            this.log("\n-------------------");
            this.log(`Total licenses shown: ${licenses.length}`);
        }
        catch (error) {
            this.error(`❌ Failed to list licenses: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
LicenseList.description = "List licenses for your software";
LicenseList.examples = [
    "$ code-checkout license:list",
    "$ code-checkout license:list --status active",
    "$ code-checkout license:list --limit 10 --offset 0",
];
LicenseList.flags = {
    status: core_1.Flags.string({
        char: "s",
        description: "Filter by status (active, inactive, revoked, all)",
        options: ["active", "inactive", "revoked", "all"],
        default: "active",
    }),
    limit: core_1.Flags.integer({
        char: "l",
        description: "Number of licenses to return",
        default: 10,
    }),
    offset: core_1.Flags.integer({
        char: "o",
        description: "Number of licenses to skip",
        default: 0,
    }),
};
exports.default = LicenseList;

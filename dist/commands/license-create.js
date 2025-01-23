"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const prompts_1 = require("../utils/prompts");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class LicenseCreate extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to create a license.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { flags } = await this.parse(LicenseCreate);
            const { publisherId, softwareId } = (0, config_1.getConfig)();
            if (!publisherId || !softwareId) {
                this.error("❌ Publisher ID or Software ID not found. Please log in and create software again.");
            }
            let licenseData;
            if (flags.maxMachines && flags.expirationDate) {
                // Use command line arguments
                licenseData = {
                    maxMachines: flags.maxMachines,
                    expirationDate: flags.expirationDate,
                };
            }
            else {
                // Use interactive prompts
                this.log("Let's create a new license...");
                licenseData = await (0, prompts_1.prompt)(prompts_1.licensePrompts);
            }
            this.log("Creating license...");
            const license = await (0, api_1.createLicense)(publisherId, softwareId, {
                maxMachines: licenseData.maxMachines,
                expirationDate: licenseData.expirationDate,
            });
            this.log("✅ License created successfully!");
            this.log(`License Key: ${license.licenseKey}`);
            this.log(`Status: ${license.status}`);
            this.log(`Max Machines: ${license.maxMachines}`);
            this.log(`Expiration Date: ${new Date(license.expirationDate).toLocaleDateString()}`);
        }
        catch (error) {
            this.error(`❌ Failed to create license: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
LicenseCreate.description = "Create a new license for your software";
LicenseCreate.examples = [
    "$ code-checkout license:create",
    "$ code-checkout license:create --maxMachines 5 --expirationDate 2025-12-31",
];
LicenseCreate.flags = {
    maxMachines: core_1.Flags.integer({
        char: "m",
        description: "Maximum number of machines",
        required: false,
    }),
    expirationDate: core_1.Flags.string({
        char: "e",
        description: "Expiration date (YYYY-MM-DD)",
        required: false,
    }),
};
exports.default = LicenseCreate;

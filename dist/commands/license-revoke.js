"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const prompts_1 = require("../utils/prompts");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class LicenseRevoke extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to revoke a license.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            const { flags } = await this.parse(LicenseRevoke);
            const { publisherId } = (0, config_1.getConfig)();
            if (!publisherId) {
                this.error("❌ Publisher ID not found. Please log in and create software again.");
            }
            let reason;
            if (flags.reason) {
                reason = flags.reason;
            }
            else {
                // Use interactive prompts
                this.log("Please provide a reason for revoking the license...");
                const answers = await (0, prompts_1.prompt)(prompts_1.revokePrompts);
                reason = answers.reason;
            }
            this.log("Revoking license...");
            const license = await (0, api_1.revokeLicense)(publisherId, flags.licenseId, {
                reason,
            });
            this.log("✅ License revoked successfully!");
            this.log(`License Key: ${license.licenseKey}`);
            this.log(`Status: ${license.status}`);
            this.log(`Revoke Reason: ${license.metadata.revokeReason}`);
            this.log(`Revoked At: ${new Date(license.metadata.revokedAt || "").toLocaleDateString()}`);
        }
        catch (error) {
            this.error(`❌ Failed to revoke license: ${error.message}
Try again or contact support if the problem persists.`);
        }
    }
}
LicenseRevoke.description = "Revoke a license";
LicenseRevoke.examples = [
    "$ code-checkout license:revoke --licenseId M5VXSPRT-FMUUGKAX8V",
    '$ code-checkout license:revoke --licenseId M5VXSPRT-FMUUGKAX8V --reason "Payment chargeback"',
];
LicenseRevoke.flags = {
    licenseId: core_1.Flags.string({
        char: "l",
        description: "License ID to revoke",
        required: true,
    }),
    reason: core_1.Flags.string({
        char: "r",
        description: "Reason for revocation",
        required: false,
    }),
};
exports.default = LicenseRevoke;

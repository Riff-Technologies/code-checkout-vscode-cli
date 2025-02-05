import { Command, Flags } from "@oclif/core";
import { prompt, revokePrompts, RevokeAnswers } from "../utils/prompts";
import { revokeLicense } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class LicenseRevoke extends Command {
  static description = "Revoke a license";

  static examples = [
    "$ code-checkout license-revoke --licenseId M5VXSPRT-FMUUGKAX8V",
    '$ code-checkout license-revoke --licenseId M5VXSPRT-FMUUGKAX8V --reason "Payment chargeback"',
  ];

  static flags = {
    licenseId: Flags.string({
      char: "l",
      description: "License ID to revoke",
      required: true,
    }),
    reason: Flags.string({
      char: "r",
      description: "Reason for revocation",
      required: false,
    }),
  };

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to revoke a license.\nRun: code-checkout login"
        );
      }

      if (!hasSoftware()) {
        this.error(
          "❌ You must create software first.\nRun: code-checkout create-software"
        );
      }

      const { flags } = await this.parse(LicenseRevoke);
      const { publisherId } = getConfig();

      if (!publisherId) {
        this.error(
          "❌ Publisher ID not found. Please log in and create software again."
        );
      }

      let reason: string;
      if (flags.reason) {
        reason = flags.reason;
      } else {
        // Use interactive prompts
        this.log("Please provide a reason for revoking the license...");
        const answers = await prompt<RevokeAnswers>(revokePrompts);
        reason = answers.reason;
      }

      this.log("Revoking license...");
      const license = await revokeLicense(publisherId, flags.licenseId, {
        reason,
      });

      this.log("✅ License revoked successfully!");
      this.log(`License Key: ${license.licenseKey}`);
      this.log(`Status: ${license.status}`);
      this.log(`Revoke Reason: ${license.metadata.revokeReason}`);
      this.log(
        `Revoked At: ${new Date(
          license.metadata.revokedAt || ""
        ).toLocaleDateString()}`
      );
    } catch (error) {
      this.error(`❌ Failed to revoke license: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }
}

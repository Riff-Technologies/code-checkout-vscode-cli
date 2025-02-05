import { Command, Flags } from "@oclif/core";
import { prompt, licensePrompts, LicenseAnswers } from "../utils/prompts";
import { createLicense } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

export default class LicenseCreate extends Command {
  static description = "Create a new license for your software";

  static examples = [
    "$ code-checkout license-create",
    "$ code-checkout license-create --maxMachines 5 --expirationDate 2025-12-31",
  ];

  static flags = {
    maxMachines: Flags.integer({
      char: "m",
      description: "Maximum number of machines",
      required: false,
    }),
    expirationDate: Flags.string({
      char: "e",
      description: "Expiration date (YYYY-MM-DD)",
      required: false,
    }),
  };

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to create a license.\nRun: code-checkout login"
        );
      }

      if (!hasSoftware()) {
        this.error(
          "❌ You must create software first.\nRun: code-checkout create-software"
        );
      }

      const { flags } = await this.parse(LicenseCreate);
      const { publisherId, softwareId } = getConfig();

      if (!publisherId || !softwareId) {
        this.error(
          "❌ Publisher ID or Software ID not found. Please log in and create software again."
        );
      }

      let licenseData: LicenseAnswers;

      if (flags.maxMachines && flags.expirationDate) {
        // Use command line arguments
        licenseData = {
          maxMachines: flags.maxMachines,
          expirationDate: flags.expirationDate,
        };
      } else {
        // Use interactive prompts
        this.log("Let's create a new license...");
        licenseData = await prompt<LicenseAnswers>(licensePrompts);
      }

      this.log("Creating license...");
      const license = await createLicense(publisherId, softwareId, {
        maxMachines: licenseData.maxMachines,
        expirationDate: licenseData.expirationDate,
      });

      this.log("✅ License created successfully!");
      this.log(`License Key: ${license.licenseKey}`);
      this.log(`Status: ${license.status}`);
      this.log(`Max Machines: ${license.maxMachines}`);
      this.log(
        `Expiration Date: ${new Date(
          license.expirationDate
        ).toLocaleDateString()}`
      );
    } catch (error) {
      this.error(`❌ Failed to create license: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }
}

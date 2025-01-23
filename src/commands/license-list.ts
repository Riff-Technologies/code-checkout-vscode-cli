import { Command, Flags } from "@oclif/core";
import { listLicenses } from "../utils/api";
import { getConfig, isAuthenticated, hasSoftware } from "../utils/config";

type LicenseStatus = "active" | "inactive" | "revoked" | "all";

export default class LicenseList extends Command {
  static description = "List licenses for your software";

  static examples = [
    "$ code-checkout license:list",
    "$ code-checkout license:list --status active",
    "$ code-checkout license:list --limit 10 --offset 0",
  ];

  static flags = {
    status: Flags.string({
      char: "s",
      description: "Filter by status (active, inactive, revoked, all)",
      options: ["active", "inactive", "revoked", "all"],
      default: "active",
    }),
    limit: Flags.integer({
      char: "l",
      description: "Number of licenses to return",
      default: 10,
    }),
    offset: Flags.integer({
      char: "o",
      description: "Number of licenses to skip",
      default: 0,
    }),
  };

  async run(): Promise<void> {
    try {
      if (!isAuthenticated()) {
        this.error(
          "❌ You must be logged in to list licenses.\nRun: code-checkout login"
        );
      }

      if (!hasSoftware()) {
        this.error(
          "❌ You must create software first.\nRun: code-checkout create-software"
        );
      }

      const { flags } = await this.parse(LicenseList);
      const { publisherId, softwareId } = getConfig();

      if (!publisherId || !softwareId) {
        this.error(
          "❌ Publisher ID or Software ID not found. Please log in and create software again."
        );
      }

      const status = flags.status as LicenseStatus;

      this.log("Fetching licenses...");
      const { licenses } = await listLicenses(publisherId, softwareId, {
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
        this.log(
          `Expiration Date: ${new Date(
            license.expirationDate
          ).toLocaleDateString()}`
        );
        if (license.metadata.customerId) {
          this.log(`Customer ID: ${license.metadata.customerId}`);
        }
        if (license.metadata.revokedAt) {
          this.log(
            `Revoked At: ${new Date(
              license.metadata.revokedAt
            ).toLocaleDateString()}`
          );
          this.log(`Revoke Reason: ${license.metadata.revokeReason}`);
        }
        this.log(
          `Created At: ${new Date(license.createdAt).toLocaleDateString()}`
        );
      });

      this.log("\n-------------------");
      this.log(`Total licenses shown: ${licenses.length}`);
    } catch (error) {
      this.error(`❌ Failed to list licenses: ${(error as Error).message}
Try again or contact support if the problem persists.`);
    }
  }
}

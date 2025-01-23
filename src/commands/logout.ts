import { Command } from "@oclif/core";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

export default class Logout extends Command {
  static description = "Log out from Code Checkout";
  static examples = ["$ code-checkout logout"];

  async run(): Promise<void> {
    try {
      const configPath = join(process.cwd(), ".code-checkout");

      if (existsSync(configPath)) {
        unlinkSync(configPath);
        this.log("✅ Successfully logged out from Code Checkout.");
      } else {
        this.log("You are not currently logged in.");
      }
    } catch (error) {
      this.error(`❌ Failed to log out: ${(error as Error).message}`);
    }
  }
}

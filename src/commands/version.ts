import { Command } from "@oclif/core";
import { readFileSync } from "fs";
import { join } from "path";

export default class Version extends Command {
  static description = "Display CLI version";
  static flags = {};
  static strict = false;
  static usage = ["--version", "-v"];
  static summary = "--version, -v  Display CLI version";
  static hidden = false;

  async run(): Promise<void> {
    try {
      // Read package.json to get the version
      const pkgPath = join(__dirname, "..", "..", "package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      this.log(`code-checkout-cli version ${pkg.version}`);
    } catch (error) {
      this.error("Failed to read version information", { exit: 1 });
    }
  }
}

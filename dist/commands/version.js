"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const fs_1 = require("fs");
const path_1 = require("path");
class Version extends core_1.Command {
    async run() {
        try {
            // Read package.json to get the version
            const pkgPath = (0, path_1.join)(__dirname, "..", "..", "package.json");
            const pkg = JSON.parse((0, fs_1.readFileSync)(pkgPath, "utf-8"));
            this.log(`code-checkout-cli version ${pkg.version}`);
        }
        catch (error) {
            this.error("Failed to read version information", { exit: 1 });
        }
    }
}
Version.description = "Display CLI version";
Version.flags = {};
Version.strict = false;
Version.usage = ["--version", "-v"];
Version.summary = "--version, -v  Display CLI version";
Version.hidden = false;
exports.default = Version;

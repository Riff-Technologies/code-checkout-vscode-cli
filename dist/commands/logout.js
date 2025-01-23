"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const fs_1 = require("fs");
const path_1 = require("path");
class Logout extends core_1.Command {
    async run() {
        try {
            const configPath = (0, path_1.join)(process.cwd(), ".code-checkout");
            if ((0, fs_1.existsSync)(configPath)) {
                (0, fs_1.unlinkSync)(configPath);
                this.log("✅ Successfully logged out from Code Checkout.");
            }
            else {
                this.log("You are not currently logged in.");
            }
        }
        catch (error) {
            this.error(`❌ Failed to log out: ${error.message}`);
        }
    }
}
Logout.description = "Log out from Code Checkout";
Logout.examples = ["$ code-checkout logout"];
exports.default = Logout;

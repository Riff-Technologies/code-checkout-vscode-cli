"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const child_process_1 = require("child_process");
const config_1 = require("../utils/config");
class RunScript extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to run the initialization script.\nRun: code-checkout login");
            }
            if (!(0, config_1.hasSoftware)()) {
                this.error("❌ You must create software first.\nRun: code-checkout create-software");
            }
            this.log("Running initialization script...");
            this.runInitScript();
            this.log("✅ Initialization script completed successfully!");
            this.log("\nYour project is now set up with Code Checkout!");
            this.log("You can now:");
            this.log("1. Commit the changes to your repository");
            this.log("2. Push your changes");
            this.log("3. Start using Code Checkout in your project");
        }
        catch (error) {
            this.handleError(error);
        }
    }
    runInitScript() {
        try {
            (0, child_process_1.execSync)("npx code-checkout-init", {
                stdio: "inherit",
                encoding: "utf-8",
            });
        }
        catch (error) {
            throw new Error(`Failed to run initialization script: ${error.message}`);
        }
    }
    handleError(error) {
        this.error(`❌ ${error.message}
Try again or contact support if the problem persists.`);
    }
}
RunScript.description = "Run the initialization script in your project";
RunScript.examples = ["$ code-checkout run-script"];
exports.default = RunScript;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const fs_1 = require("fs");
const path_1 = require("path");
const api_1 = require("../utils/api");
const config_1 = require("../utils/config");
class CreateSoftware extends core_1.Command {
    async run() {
        try {
            if (!(0, config_1.isAuthenticated)()) {
                this.error("❌ You must be logged in to create software.\nRun: code-checkout login");
            }
            this.log("Reading package.json...");
            const packageJson = this.readPackageJson();
            const { publisherId } = (0, config_1.getConfig)();
            if (!publisherId) {
                this.error("❌ Publisher ID not found. Please log in again.");
            }
            this.log("Creating software record...");
            const software = await (0, api_1.createSoftware)(publisherId, packageJson.name, packageJson.version);
            await (0, config_1.saveConfig)({ softwareId: software.id });
            this.log("✅ Software record created successfully!");
            this.log(`Software ID: ${software.id}`);
            this.log(`Name: ${software.name}`);
            this.log(`Version: ${software.version}`);
            this.log(`Extension ID: ${software.extensionId}`);
            this.log("\nNext step:");
            this.log("Create pricing: code-checkout create-pricing");
        }
        catch (error) {
            this.handleError(error);
        }
    }
    readPackageJson() {
        try {
            const packageJsonPath = (0, path_1.join)(process.cwd(), "package.json");
            const packageJsonContent = (0, fs_1.readFileSync)(packageJsonPath, "utf-8");
            return JSON.parse(packageJsonContent);
        }
        catch (error) {
            this.error("❌ Could not read package.json. Make sure you're in the root directory of your project.");
        }
    }
    handleError(error) {
        this.error(`❌ Failed to create software: ${error.message}
Try again or contact support if the problem persists.`);
    }
}
CreateSoftware.description = "Create a software record from your package.json";
CreateSoftware.examples = ["$ code-checkout create-software"];
exports.default = CreateSoftware;

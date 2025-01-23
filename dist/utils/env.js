"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
// Load environment variables from .env file
(0, dotenv_1.config)();
// Determine if we're running from a production build by checking if the code is minified/optimized
const isProductionBuild = __filename.includes("/dist/") || __filename.includes("\\dist\\");
/**
 * Environment variables configuration
 */
exports.env = {
    /**
     * Current environment
     */
    nodeEnv: process.env.NODE_ENV || (isProductionBuild ? "production" : "development"),
    /**
     * API URL for Code Checkout service
     */
    apiUrl: "https://api.riff-tech.com/v1",
    /**
     * Check if we're in development mode
     */
    isDevelopment: !isProductionBuild && process.env.NODE_ENV !== "production",
    /**
     * Check if we're in production mode
     */
    isProduction: isProductionBuild || process.env.NODE_ENV === "production",
    /**
     * Debug mode (enabled in development by default)
     */
    debug: process.env.DEBUG === "true" ||
        (!isProductionBuild && process.env.NODE_ENV !== "production"),
};
// Log environment configuration in development mode
if (exports.env.isDevelopment) {
    console.log("Environment Configuration:");
    console.log("-------------------------");
    console.log(`Node Environment: ${exports.env.nodeEnv}`);
    console.log(`API URL: ${exports.env.apiUrl}`);
    console.log(`Debug Mode: ${exports.env.debug}`);
    console.log("-------------------------");
}

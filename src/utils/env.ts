import { config } from "dotenv";

// Load environment variables from .env file
config();

// Determine if we're running from a production build by checking if the code is minified/optimized
const isProductionBuild = false;
//__filename.includes("/dist/") || __filename.includes("\\dist\\");

/**
 * Environment variables configuration
 */
export const env = {
  /**
   * Current environment
   */
  nodeEnv:
    process.env.NODE_ENV || (isProductionBuild ? "production" : "development"),

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
  debug:
    process.env.DEBUG === "true" ||
    (!isProductionBuild && process.env.NODE_ENV !== "production"),
} as const;

// Log environment configuration in development mode
if (env.isDevelopment) {
  console.log("Environment Configuration:");
  console.log("-------------------------");
  console.log(`Node Environment: ${env.nodeEnv}`);
  console.log(`API URL: ${env.apiUrl}`);
  console.log(`Debug Mode: ${env.debug}`);
  console.log("-------------------------");
}

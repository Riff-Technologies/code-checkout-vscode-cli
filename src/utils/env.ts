import { config } from "dotenv";

// Load environment variables from .env file
config();

/**
 * Environment variables configuration
 */
export const env = {
  /**
   * Current environment
   */
  nodeEnv: process.env.NODE_ENV || "development",

  /**
   * API URL for Code Checkout service
   */
  apiUrl: "https://api.riff-tech.com/v1",

  /**
   * Check if we're in development mode
   */
  isDevelopment: process.env.NODE_ENV !== "production",

  /**
   * Check if we're in production mode
   */
  isProduction: process.env.NODE_ENV === "production",

  /**
   * Debug mode (enabled in development by default)
   */
  debug: process.env.DEBUG === "true" || process.env.NODE_ENV !== "production",
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

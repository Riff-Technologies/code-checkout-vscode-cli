import { join } from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { CodeCheckoutConfig } from "../types";
import { env } from "./env";

const CONFIG_FILE = ".code-checkout";

/**
 * Get the full path to the config file
 */
function getConfigPath(): string {
  return join(process.cwd(), CONFIG_FILE);
}

/**
 * Save configuration data to the config file
 */
export function saveConfig(data: Partial<CodeCheckoutConfig>): void {
  try {
    const configPath = getConfigPath();
    const existing: Partial<CodeCheckoutConfig> = existsSync(configPath)
      ? JSON.parse(readFileSync(configPath, "utf-8"))
      : {};

    const updated = { ...existing, ...data };
    writeFileSync(configPath, JSON.stringify(updated, null, 2));

    if (env.debug) {
      console.log("Config saved:", updated);
      console.log("Config location:", configPath);
    }
  } catch (error) {
    throw new Error(`Failed to save config: ${(error as Error).message}`);
  }
}

/**
 * Get configuration data from the config file
 */
export function getConfig(): Partial<CodeCheckoutConfig> {
  try {
    const configPath = getConfigPath();
    if (!existsSync(configPath)) {
      if (env.debug) {
        console.log("No config file found at:", configPath);
      }
      return {};
    }
    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    if (env.debug) {
      console.log("Config loaded:", config);
      console.log("Config location:", configPath);
    }
    return config;
  } catch (error) {
    throw new Error(`Failed to read config: ${(error as Error).message}`);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const config = getConfig();
  const authenticated = Boolean(config.jwt && config.publisherId);
  if (env.debug) {
    console.log("Authentication check:", {
      jwt: Boolean(config.jwt),
      publisherId: Boolean(config.publisherId),
      authenticated,
    });
  }
  return authenticated;
}

/**
 * Check if software is created
 */
export function hasSoftware(): boolean {
  const config = getConfig();
  const hasSoftware = Boolean(config.softwareId);
  if (env.debug) {
    console.log("Software check:", {
      softwareId: Boolean(config.softwareId),
      hasSoftware,
    });
  }
  return hasSoftware;
}

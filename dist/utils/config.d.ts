import { CodeCheckoutConfig } from "../types";
/**
 * Save configuration data to the config file
 */
export declare function saveConfig(data: Partial<CodeCheckoutConfig>): void;
/**
 * Get configuration data from the config file
 */
export declare function getConfig(): Partial<CodeCheckoutConfig>;
/**
 * Check if user is authenticated
 */
export declare function isAuthenticated(): boolean;
/**
 * Check if software is created
 */
export declare function hasSoftware(): boolean;

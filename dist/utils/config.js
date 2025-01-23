"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSoftware = exports.isAuthenticated = exports.getConfig = exports.saveConfig = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
const env_1 = require("./env");
const CONFIG_FILE = ".code-checkout";
/**
 * Get the full path to the config file
 */
function getConfigPath() {
    return (0, path_1.join)(process.cwd(), CONFIG_FILE);
}
/**
 * Save configuration data to the config file
 */
function saveConfig(data) {
    try {
        const configPath = getConfigPath();
        const existing = (0, fs_1.existsSync)(configPath)
            ? JSON.parse((0, fs_1.readFileSync)(configPath, "utf-8"))
            : {};
        const updated = { ...existing, ...data };
        (0, fs_1.writeFileSync)(configPath, JSON.stringify(updated, null, 2));
        if (env_1.env.debug) {
            console.log("Config saved:", updated);
            console.log("Config location:", configPath);
        }
    }
    catch (error) {
        throw new Error(`Failed to save config: ${error.message}`);
    }
}
exports.saveConfig = saveConfig;
/**
 * Get configuration data from the config file
 */
function getConfig() {
    try {
        const configPath = getConfigPath();
        if (!(0, fs_1.existsSync)(configPath)) {
            if (env_1.env.debug) {
                console.log("No config file found at:", configPath);
            }
            return {};
        }
        const config = JSON.parse((0, fs_1.readFileSync)(configPath, "utf-8"));
        if (env_1.env.debug) {
            console.log("Config loaded:", config);
            console.log("Config location:", configPath);
        }
        return config;
    }
    catch (error) {
        throw new Error(`Failed to read config: ${error.message}`);
    }
}
exports.getConfig = getConfig;
/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    const config = getConfig();
    const authenticated = Boolean(config.jwt && config.publisherId);
    if (env_1.env.debug) {
        console.log("Authentication check:", {
            jwt: Boolean(config.jwt),
            publisherId: Boolean(config.publisherId),
            authenticated,
        });
    }
    return authenticated;
}
exports.isAuthenticated = isAuthenticated;
/**
 * Check if software is created
 */
function hasSoftware() {
    const config = getConfig();
    const hasSoftware = Boolean(config.softwareId);
    if (env_1.env.debug) {
        console.log("Software check:", {
            softwareId: Boolean(config.softwareId),
            hasSoftware,
        });
    }
    return hasSoftware;
}
exports.hasSoftware = hasSoftware;

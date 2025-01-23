"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.createPricing = exports.createSoftware = exports.getStripeLink = exports.confirmUser = exports.registerUser = void 0;
const axios_1 = __importStar(require("axios"));
const config_1 = require("./config");
const env_1 = require("./env");
// Log the API URL being used (helpful for debugging)
if (env_1.env.isDevelopment) {
    console.log(`Using API URL: ${env_1.env.apiUrl}`);
}
/**
 * Create axios instance with default configuration
 */
const api = axios_1.default.create({
    baseURL: env_1.env.apiUrl,
    timeout: 10000,
});
/**
 * Handle API errors
 */
function handleApiError(error) {
    if (env_1.env.debug) {
        console.error("API Error:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            method: error.config?.method,
        });
    }
    if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
    }
    if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
    }
    if (error.response?.status === 403) {
        throw new Error("Not authorized. Please check your permissions.");
    }
    if (error.response?.status === 404) {
        throw new Error("Resource not found. Please check the request.");
    }
    throw new Error(error.message || "An unexpected error occurred");
}
/**
 * Register a new user
 */
async function registerUser(userData) {
    try {
        await api.post("/users", userData);
    }
    catch (error) {
        handleApiError(error);
    }
}
exports.registerUser = registerUser;
/**
 * Confirm user registration
 */
async function confirmUser(confirmationData) {
    try {
        if (env_1.env.debug) {
            console.log("Confirming user with data:", confirmationData);
        }
        const response = await api.post("/users/confirm", confirmationData);
        if (env_1.env.debug) {
            console.log("Confirmation response:", response.data);
        }
        // Check if we got a valid response
        if (!response.data) {
            throw new Error("Empty response from server");
        }
        // Log each expected field
        if (env_1.env.debug) {
            console.log("Response fields:", {
                hasMessage: Boolean(response.data.message),
                hasUsername: Boolean(response.data.username),
                message: response.data.message,
                username: response.data.username,
            });
        }
        return response.data;
    }
    catch (error) {
        if (env_1.env.debug && error instanceof axios_1.AxiosError) {
            console.error("Confirmation error details:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
        }
        handleApiError(error);
    }
}
exports.confirmUser = confirmUser;
/**
 * Get Stripe onboarding link
 */
async function getStripeLink() {
    try {
        const config = (0, config_1.getConfig)();
        console.log("Config:", config);
        if (!config.publisherId || !config.jwt) {
            throw new Error("Missing authentication. Please log in again.");
        }
        const response = await api.get(`/publishers/${config.publisherId}/stripe/connect-url?returnUrl=https://www.code-checkout.com`, {
            headers: { Authorization: `Bearer ${config.jwt}` },
        });
        if (!response.data?.url) {
            throw new Error("Invalid response from server: missing Stripe URL");
        }
        return response.data.url;
    }
    catch (error) {
        handleApiError(error);
    }
}
exports.getStripeLink = getStripeLink;
/**
 * Create software record
 */
async function createSoftware(publisherId, name, version) {
    try {
        const { jwt } = (0, config_1.getConfig)();
        const response = await api.post(`/publishers/${publisherId}/software`, {
            name,
            version,
            metadata: {
                category: "Development Tools",
                platform: "Cross-platform",
            },
            extensionId: `${publisherId}.${name}`,
        }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        return response.data;
    }
    catch (error) {
        handleApiError(error);
    }
}
exports.createSoftware = createSoftware;
/**
 * Create pricing for software
 */
async function createPricing(publisherId, softwareId, model, price) {
    try {
        const { jwt } = (0, config_1.getConfig)();
        await api.post(`/publishers/${publisherId}/software/${softwareId}/pricing`, {
            model,
            price,
            currency: "USD",
            billingCycle: model === "subscription" ? "month" : undefined,
        }, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
    }
    catch (error) {
        handleApiError(error);
    }
}
exports.createPricing = createPricing;
/**
 * Login user
 */
async function loginUser(loginData) {
    try {
        if (env_1.env.debug) {
            console.log("Logging in user:", { username: loginData.username });
        }
        const response = await api.post("/users/login", loginData);
        if (env_1.env.debug) {
            console.log("Login successful:", {
                message: response.data.message,
                hasTokens: Boolean(response.data.tokens),
            });
        }
        if (!response.data?.tokens?.idToken) {
            throw new Error("Invalid response from server: missing authentication tokens");
        }
        return response.data;
    }
    catch (error) {
        if (env_1.env.debug && error instanceof axios_1.AxiosError) {
            console.error("Login error details:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });
        }
        handleApiError(error);
    }
}
exports.loginUser = loginUser;

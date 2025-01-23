/**
 * Environment variables configuration
 */
export declare const env: {
    /**
     * Current environment
     */
    readonly nodeEnv: string;
    /**
     * API URL for Code Checkout service
     */
    readonly apiUrl: "https://api.riff-tech.com/v1";
    /**
     * Check if we're in development mode
     */
    readonly isDevelopment: boolean;
    /**
     * Check if we're in production mode
     */
    readonly isProduction: boolean;
    /**
     * Debug mode (enabled in development by default)
     */
    readonly debug: boolean;
};

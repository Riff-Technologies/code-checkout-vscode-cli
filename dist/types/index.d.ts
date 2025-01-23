/**
 * Configuration stored in .code-checkout file
 */
export interface CodeCheckoutConfig {
    publisherId: string;
    jwt: string;
    softwareId?: string;
    username?: string;
}
/**
 * User registration request
 */
export interface UserRegistrationRequest {
    username: string;
    email: string;
    password: string;
    givenName: string;
    familyName: string;
    company?: string;
    publisher: string;
}
/**
 * User login request
 */
export interface UserLoginRequest {
    username: string;
    password: string;
}
/**
 * User login response
 */
export interface UserLoginResponse {
    message: string;
    tokens: {
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
    };
}
/**
 * User confirmation request
 */
export interface UserConfirmationRequest {
    username: string;
    confirmationCode: string;
}
/**
 * Response from confirmation
 */
export interface ConfirmationResponse {
    message: string;
    username: string;
}
/**
 * Response from Cognito signup
 */
export interface CognitoSignUpResponse {
    message: string;
    username: string;
}
/**
 * Software creation response
 */
export interface SoftwareResponse {
    id: string;
    name: string;
    version: string;
    extensionId: string;
    metadata: {
        category: string;
        platform: string;
    };
}
/**
 * Pricing model types
 */
export type PricingModel = "subscription" | "one-time";
export type BillingCycle = "month" | undefined;
/**
 * Pricing creation request
 */
export interface PricingRequest {
    model: PricingModel;
    price: number;
    currency: string;
    billingCycle: BillingCycle;
}
/**
 * API error response
 */
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}

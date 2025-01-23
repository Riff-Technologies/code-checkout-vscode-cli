import { CognitoSignUpResponse, SoftwareResponse, PricingRequest, UserRegistrationRequest, UserConfirmationRequest, UserLoginRequest, UserLoginResponse } from "../types";
/**
 * Register a new user
 */
export declare function registerUser(userData: UserRegistrationRequest): Promise<void>;
/**
 * Confirm user registration
 */
export declare function confirmUser(confirmationData: UserConfirmationRequest): Promise<CognitoSignUpResponse>;
/**
 * Get Stripe onboarding link
 */
export declare function getStripeLink(): Promise<string>;
/**
 * Create software record
 */
export declare function createSoftware(publisherId: string, name: string, version: string): Promise<SoftwareResponse>;
/**
 * Create pricing for software
 */
export declare function createPricing(publisherId: string, softwareId: string, model: PricingRequest["model"], price: number): Promise<void>;
/**
 * Login user
 */
export declare function loginUser(loginData: UserLoginRequest): Promise<UserLoginResponse>;

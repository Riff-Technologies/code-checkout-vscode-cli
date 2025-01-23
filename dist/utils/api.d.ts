import { SoftwareResponse, PricingRequest, UserRegistrationRequest, UserConfirmationRequest, UserLoginRequest, UserLoginResponse, ConfirmationResponse, CreateLicenseRequest, License, ListLicensesParams, RevokeLicenseRequest, SoftwarePricing, SoftwareDetails, AnalyticsEventsParams, AnalyticsEvent, AnalyticsSummary } from "../types";
/**
 * Register a new user
 */
export declare function registerUser(userData: UserRegistrationRequest): Promise<void>;
/**
 * Confirm user registration
 */
export declare function confirmUser(confirmationData: UserConfirmationRequest): Promise<ConfirmationResponse>;
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
/**
 * Create a new license
 */
export declare function createLicense(publisherId: string, softwareId: string, data: CreateLicenseRequest): Promise<License>;
/**
 * List licenses with optional filtering
 */
export declare function listLicenses(publisherId: string, softwareId: string, params: ListLicensesParams): Promise<{
    licenses: License[];
}>;
/**
 * Revoke a license
 */
export declare function revokeLicense(publisherId: string, licenseId: string, data: RevokeLicenseRequest): Promise<License>;
/**
 * Get software pricing
 */
export declare function getSoftwarePricing(publisherId: string, softwareId: string): Promise<SoftwarePricing>;
/**
 * Get software details
 */
export declare function getSoftwareDetails(publisherId: string, softwareId: string): Promise<SoftwareDetails>;
/**
 * Get analytics events
 */
/**
 * Get analytics events with optional filtering
 * @param params - Optional parameters for filtering events
 * @returns Promise containing array of analytics events
 */
export declare function getAnalyticsEvents(params: AnalyticsEventsParams): Promise<{
    events: AnalyticsEvent[];
}>;
/**
 * Get analytics summary with optional date range filtering
 * @param params - Optional parameters for filtering date range
 * @returns Promise containing analytics summary data
 */
export declare function getAnalyticsSummary(params?: {
    startTime?: string;
    endTime?: string;
}): Promise<AnalyticsSummary>;

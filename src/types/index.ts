/**
 * Configuration stored in .code-checkout file
 */
export interface CodeCheckoutConfig {
  publisherId: string;
  jwt: string;
  softwareId?: string;
  username?: string;
  extensionId?: string;
  publisher?: string;
  stripeIntegrated?: boolean;
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
  freeTrialDays?: number;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * License types and interfaces
 */
export interface License {
  licenseKey: string;
  publisherId: string;
  softwareId: string;
  status: "active" | "inactive" | "revoked";
  maxMachines: number;
  expirationDate: string;
  metadata: {
    createdBy: string;
    note?: string;
    customerId?: string;
    stripePriceId?: string;
    revokedAt?: string;
    revokeReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLicenseRequest {
  maxMachines: number;
  expirationDate: string;
}

export interface RevokeLicenseRequest {
  reason: string;
}

export interface ListLicensesParams {
  status?: "active" | "inactive" | "revoked" | "all";
  limit?: number;
  offset?: number;
}

/**
 * Software pricing and details types
 */
export interface SoftwarePricing {
  model: "subscription" | "one-time";
  publisherId: string;
  currency: string;
  price: number;
  metadata?: {
    discount?: string;
  };
  freeTrialDays?: number;
  billingCycle?: "monthly" | "yearly";
}

export interface SoftwareDetails extends SoftwareResponse {
  status: "active" | "inactive";
  metadata: {
    category: string;
    platform: string;
  };
}

/**
 * Analytics types
 */
export interface AnalyticsEvent {
  commandId: string;
  hasValidLicense: boolean;
  timestamp: string;
  metadata?: {
    category?: string;
    duration?: number;
  };
}

export interface AnalyticsSummary {
  totalEvents: number;
  commandCounts: Record<string, number>;
  licenseStatusCounts: {
    valid: number;
    invalid: number;
  };
  timeRange: {
    start: string;
    end: string;
  };
}

export interface AnalyticsEventsParams {
  commandId?: string;
  startTime?: string;
  endTime?: string;
}

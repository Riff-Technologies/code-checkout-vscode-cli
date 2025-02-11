import axios, { AxiosError } from "axios";
import { getConfig } from "./config";
import { env } from "./env";
import {
  SoftwareResponse,
  PricingRequest,
  ApiError,
  UserRegistrationRequest,
  UserConfirmationRequest,
  UserLoginRequest,
  UserLoginResponse,
  ConfirmationResponse,
  CreateLicenseRequest,
  License,
  ListLicensesParams,
  RevokeLicenseRequest,
  SoftwarePricing,
  SoftwareDetails,
  AnalyticsEventsParams,
  AnalyticsEvent,
  AnalyticsSummary,
} from "../types";

// Log the API URL being used (helpful for debugging)
if (env.isDevelopment) {
  console.log(`Using API URL: ${env.apiUrl}`);
}

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
});

/**
 * Handle API errors
 */
function handleApiError(error: AxiosError<ApiError>): never {
  if (env.debug) {
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
export async function registerUser(
  userData: UserRegistrationRequest
): Promise<void> {
  try {
    await api.post("/users", userData);
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Confirm user registration
 */
export async function confirmUser(
  confirmationData: UserConfirmationRequest
): Promise<ConfirmationResponse> {
  try {
    if (env.debug) {
      console.log("Confirming user with data:", confirmationData);
    }

    const response = await api.post<ConfirmationResponse>(
      "/users/confirm",
      confirmationData
    );

    if (env.debug) {
      console.log("Confirmation response:", response.data);
    }

    // Check if we got a valid response
    if (!response.data) {
      throw new Error("Empty response from server");
    }

    // Log each expected field
    if (env.debug) {
      console.log("Response fields:", {
        hasMessage: Boolean(response.data.message),
        hasUsername: Boolean(response.data.username),
        message: response.data.message,
        username: response.data.username,
      });
    }

    return response.data;
  } catch (error) {
    if (env.debug && error instanceof AxiosError) {
      console.error("Confirmation error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Get Stripe onboarding link
 */
export async function getStripeLink(): Promise<string> {
  try {
    const config = getConfig();

    if (!config.publisherId || !config.jwt) {
      throw new Error("Missing authentication. Please log in again.");
    }

    const response = await api.get<{ url: string }>(
      `/publishers/${config.publisherId}/stripe/connect-url?returnUrl=https://codecheckout.dev/connect`,
      {
        headers: { Authorization: `Bearer ${config.jwt}` },
      }
    );

    if (!response.data?.url) {
      throw new Error("Invalid response from server: missing Stripe URL");
    }

    return response.data.url;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Create software record
 */
export async function createSoftware(
  publisherId: string,
  name: string,
  version: string
): Promise<SoftwareResponse> {
  try {
    const { jwt } = getConfig();
    const response = await api.post<SoftwareResponse>(
      `/publishers/${publisherId}/software`,
      {
        name,
        version,
        metadata: {
          category: "Development Tools",
          platform: "Cross-platform",
        },
        extensionId: `${publisherId}.${name}`,
      },
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Create pricing for software
 */
export async function createPricing(
  publisherId: string,
  softwareId: string,
  model: PricingRequest["model"],
  price: number,
  freeTrialDays?: number
): Promise<void> {
  try {
    const { jwt } = getConfig();
    await api.post(
      `/publishers/${publisherId}/software/${softwareId}/pricing`,
      {
        model,
        price,
        currency: "USD",
        billingCycle: model === "subscription" ? "month" : undefined,
        freeTrialDays,
      } as PricingRequest,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Login user
 */
export async function loginUser(
  loginData: UserLoginRequest
): Promise<UserLoginResponse> {
  try {
    if (env.debug) {
      console.log("Logging in user:", { username: loginData.username });
    }

    const response = await api.post<UserLoginResponse>(
      "/users/login",
      loginData
    );

    if (env.debug) {
      console.log("Login successful:", {
        message: response.data.message,
        hasTokens: Boolean(response.data.tokens),
      });
    }

    if (!response.data?.tokens?.idToken) {
      throw new Error(
        "Invalid response from server: missing authentication tokens"
      );
    }

    return response.data;
  } catch (error) {
    if (env.debug && error instanceof AxiosError) {
      console.error("Login error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Create a new license
 */
export async function createLicense(
  publisherId: string,
  softwareId: string,
  data: CreateLicenseRequest
): Promise<License> {
  try {
    const { jwt } = getConfig();
    const response = await api.post<License>(
      `/publishers/${publisherId}/software/${softwareId}/licenses`,
      data,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * List licenses with optional filtering
 */
export async function listLicenses(
  publisherId: string,
  softwareId: string,
  params: ListLicensesParams
): Promise<{ licenses: License[] }> {
  try {
    const { jwt } = getConfig();
    const response = await api.get<{ licenses: License[] }>(
      `/publishers/${publisherId}/software/${softwareId}/licenses`,
      {
        params,
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Revoke a license
 */
export async function revokeLicense(
  publisherId: string,
  licenseId: string,
  data: RevokeLicenseRequest
): Promise<License> {
  try {
    const { jwt } = getConfig();
    const response = await api.post<License>(
      `/publishers/${publisherId}/licenses/${licenseId}/revoke`,
      data,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Get software pricing
 */
export async function getSoftwarePricing(
  publisherId: string,
  softwareId: string
): Promise<SoftwarePricing> {
  try {
    const { jwt } = getConfig();
    const response = await api.get<SoftwarePricing>(
      `/publishers/${publisherId}/software/${softwareId}/pricing`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Get software details
 */
export async function getSoftwareDetails(
  publisherId: string,
  softwareId: string
): Promise<SoftwareDetails> {
  try {
    const { jwt } = getConfig();
    const response = await api.get<SoftwareDetails>(
      `/publishers/${publisherId}/software/${softwareId}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Get analytics events
 */
/**
 * Get analytics events with optional filtering
 * @param params - Optional parameters for filtering events
 * @returns Promise containing array of analytics events
 */
export async function getAnalyticsEvents(
  params: AnalyticsEventsParams
): Promise<{ events: AnalyticsEvent[] }> {
  try {
    const { jwt, publisherId, softwareId, publisher, extensionId } =
      getConfig();

    // Default time range to last 7 days if not provided
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const queryParams = new URLSearchParams();
    queryParams.append("publisherId", publisherId || "");
    queryParams.append(
      "startTime",
      params.startTime || oneWeekAgo.toISOString()
    );
    queryParams.append("endTime", params.endTime || now.toISOString());
    queryParams.append("extensionId", `${publisher}.${extensionId}`);
    if (params.commandId) {
      queryParams.append("commandId", params.commandId);
    }

    const response = await api.get<{ events: AnalyticsEvent[] }>(
      `/analytics/events?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

/**
 * Get analytics summary with optional date range filtering
 * @param params - Optional parameters for filtering date range
 * @returns Promise containing analytics summary data
 */
export async function getAnalyticsSummary(params?: {
  startTime?: string;
  endTime?: string;
}): Promise<AnalyticsSummary> {
  try {
    const { jwt, publisherId, softwareId, publisher, extensionId } =
      getConfig();

    // Default time range to last 7 days if not provided
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const queryParams = new URLSearchParams();
    queryParams.append("publisherId", publisherId || "");
    queryParams.append("softwareId", softwareId || "");
    queryParams.append(
      "startTime",
      params?.startTime || oneWeekAgo.toISOString()
    );
    queryParams.append("endTime", params?.endTime || now.toISOString());
    queryParams.append("extensionId", `${publisher}.${extensionId}`);

    const response = await api.get<AnalyticsSummary>(
      `/analytics/summary?${queryParams.toString()}`,
      {
        headers: { Authorization: `Bearer ${jwt}` },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error as AxiosError<ApiError>);
  }
}

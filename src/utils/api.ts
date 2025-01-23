import axios, { AxiosError } from "axios";
import { getConfig } from "./config";
import { env } from "./env";
import {
  CognitoSignUpResponse,
  SoftwareResponse,
  PricingRequest,
  ApiError,
  UserRegistrationRequest,
  UserConfirmationRequest,
  UserLoginRequest,
  UserLoginResponse,
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
): Promise<CognitoSignUpResponse> {
  try {
    if (env.debug) {
      console.log("Confirming user with data:", confirmationData);
    }

    const response = await api.post<CognitoSignUpResponse>(
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
        hasPublisherId: Boolean(response.data.publisherId),
        hasJwt: Boolean(response.data.jwt),
        hasUsername: Boolean(response.data.username),
        publisherId: response.data.publisherId,
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
    console.log("Config:", config);

    if (!config.publisherId || !config.jwt) {
      throw new Error("Missing authentication. Please log in again.");
    }

    const response = await api.get<{ url: string }>(
      `/publishers/${config.publisherId}/stripe/connect-url?returnUrl=https://www.code-checkout.com`,
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
  price: number
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

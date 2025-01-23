Tech Plan for Extending the code-checkout CLI Tool

1. Overview

The code-checkout CLI tool will be extended to include new commands related to license management, software details, and analytics. These commands will require JWT authentication and interact with the backend API using the Authorization: Bearer {{jwt}} header. The output will be user-friendly, providing concise yet descriptive information in an easily readable format.

2. New Commands

License Management Commands
	1.	Create License
	•	Command: code-checkout license:create
	•	Description: Creates a new license for the specified software.
	•	API Endpoint: POST {{baseUrl}}/publishers/:publisherId/software/:softwareId/licenses
	•	Inputs:
	•	maxMachines (required, integer)
	•	expirationDate (required) Note: the user will enter an expiration date in this format `YYYY-MM-DD` and the CLI will transform this to be an ISO date that defaults the time to `00:00:00`
	•	Output: License details with licenseKey, status, and metadata.
	•	Example CLI Usage:

code-checkout license:create --maxMachines 5 --expirationDate 2025-12-31


	•	Example Server Response:

{
  "licenseKey": "M5VYNSKL-H8BNHXFUX7N",
  "publisherId": "12bcc46e-b3aa-4379-b311-74a0c37718bf",
  "softwareId": "eca32285-65d4-4c97-a1ad-320a428ac4ee",
  "status": "active",
  "maxMachines": 5,
  "expirationDate": "2025-12-31T23:59:59Z",
  "metadata": {
    "createdBy": "admin",
    "note": "Manual license creation"
  },
  "createdAt": "2025-01-14T04:16:30.309Z",
  "updatedAt": "2025-01-14T04:16:30.309Z"
}


	2.	List Licenses
	•	Command: code-checkout license:list
	•	Description: Lists licenses with optional filtering by status (active, inactive, revoked, or all).
	•	API Endpoint: GET {{baseUrl}}/publishers/:publisherId/software/:softwareId/licenses
	•	Inputs:
	•	status (optional)
	•	limit and offset for pagination
	•	Output: Paginated list of licenses.
	•	Example CLI Usage:

code-checkout license:list --status active --limit 10 --offset 0


	•	Example Server Response:

{
  "licenses": [
    {
      "licenseKey": "M660CVXJ-OB2MSMK033M",
      "status": "active",
      "maxMachines": 5,
      "expirationDate": "2025-02-21T05:02:23.000Z",
      "metadata": {
        "customerId": "cus_RcpGiTwNCZJLmt",
        "stripePriceId": "price_1QjZYhK09rYEIQrulOR2KJ4D"
      },
      "createdAt": "2025-01-21T05:07:01.780Z",
      "updatedAt": "2025-01-21T05:07:01.780Z"
    }
  ]
}


	3.	Revoke License
	•	Command: code-checkout license:revoke
	•	Description: Revokes a specific license, specifying the reason and metadata.
	•	API Endpoint: POST {{baseUrl}}/publishers/:publisherId/licenses/:licenseId/revoke
	•	Inputs:
	•	licenseId (required)
	•	reason (required)
	•	Output: Updated license status and metadata.
	•	Example CLI Usage:

code-checkout license:revoke --licenseId M5VXSPRT-FMUUGKAX8V --reason "Payment chargeback"


	•	Example Server Response:

{
  "licenseKey": "M5VXSPRT-FMUUGKAX8V",
  "status": "revoked",
  "revokeReason": "Payment chargeback",
  "metadata": {
    "processedBy": "admin",
    "notes": "Customer requested refund",
    "revokedAt": "2025-01-14T04:15:33.141Z"
  },
  "updatedAt": "2025-01-14T04:15:33.878Z"
}

Software Commands
	1.	Get Pricing Model
	•	Command: code-checkout software:pricing
	•	Description: Fetches the pricing model for the specified software.
	•	API Endpoint: GET {{baseUrl}}/publishers/:publisherId/software/:softwareId/pricing
	•	Output: Details of the pricing model, including price, currency, and any metadata.
	•	Example CLI Usage:

code-checkout software:pricing


	•	Example Server Response:

{
  "model": "subscription",
  "publisherId": "12bcc46e-b3aa-4379-b311-74a0c37718bf",
  "currency": "USD",
  "price": 9.99,
  "metadata": {
    "discount": "10% for first month"
  },
  "freeTrialDays": 14,
  "billingCycle": "monthly"
}


	2.	Get Software Details
	•	Command: code-checkout software:get
	•	Description: Retrieves software details such as name, version, and status.
	•	API Endpoint: GET {{baseUrl}}/publishers/:publisherId/software/:softwareId
	•	Output: Software information including metadata.
	•	Example CLI Usage:

code-checkout software:get


	•	Example Server Response:

{
  "publisherId": "12bcc46e-b3aa-4379-b311-74a0c37718bf",
  "name": "testmystuff",
  "version": "0.0.1",
  "status": "active",
  "metadata": {
    "category": "Development Tools",
    "platform": "Cross-platform"
  }
}

Analytics Commands
	1.	Get Analytics Events
	•	Command: code-checkout analytics:events
	•	Description: Retrieves analytics events with optional filtering by commandId.
	•	API Endpoint: GET {{baseUrl}}/analytics/events
	•	Inputs:
	•	commandId (optional)
	•	startTime (default to 1 week prior) Note: the user will enter a startTime in this format `YYYY-MM-DD` and the CLI will transform this to be an ISO date that defaults the time to `00:00:00`
  • endTime (default to current date) Note: the user will enter an endTime in this format `YYYY-MM-DD` and the CLI will transform this to be an ISO date that defaults the time to `23:59:59`
	•	Output: List of events with metadata.
	•	Example CLI Usage:

code-checkout analytics:events --commandId my-command --startTime 2024-01-09 --endTime 2024-01-16


	•	Example Server Response:

{
  "events": [
    {
      "commandId": "my-command",
      "hasValidLicense": true,
      "timestamp": "2024-01-09T00:00:00Z",
      "metadata": {
        "category": "Testing",
        "duration": 1000
      }
    }
  ]
}


	2.	Get Analytics Summary
	•	Command: code-checkout analytics:summary
	•	Description: Retrieves a summary of analytics data within a specified time range. Note: the user will enter a time range in this format `YYYY-MM-DD` and the CLI will transform this to be an ISO date that defaults the start time to `00:00:00 and the end time to `23:59:59`
	•	API Endpoint: GET {{baseUrl}}/analytics/summary
	•	Output: Summary data including total events, command counts, and license status counts.
	•	Example CLI Usage:

code-checkout analytics:summary


	•	Example Server Response:

{
  "totalEvents": 12,
  "commandCounts": {
    "activateOnlineCommand": 5,
    "helloWorld": 4,
    "activateLicenseCommand": 1,
    "revokeLicenseCommand": 2
  },
  "licenseStatusCounts": {
    "valid": 2,
    "invalid": 10
  },
  "timeRange": {
    "start": "2024-01-12T00:00:00Z",
    "end": "2026-01-13T23:59:59Z"
  }
}

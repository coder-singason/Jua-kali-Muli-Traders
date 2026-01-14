import crypto from "crypto";

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  environment: "sandbox" | "production";
}

const getBaseUrl = (environment: string) => {
  return environment === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

export class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: MpesaConfig) {
    this.config = config;
    this.baseUrl = getBaseUrl(config.environment);
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
      if (this.accessToken === null) {
        throw new Error("Access token is null");
      }
      return this.accessToken as string;
    }

    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString("base64");

    const response = await fetch(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get M-Pesa access token");
    }

    const data = await response.json();
    
    // FIX: Validate existence of token before assignment and return
    if (!data.access_token) {
      throw new Error("Invalid response from M-Pesa: No access_token found");
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + Number(data.expires_in) * 1000;

    // TypeScript now knows this is a string because of the check above
    return this.accessToken as string; // Use non-null assertion
  }

  /**
   * Generate password for STK Push
   */
  private generatePassword(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
    const password = Buffer.from(
      `${this.config.businessShortCode}${this.config.passkey}${timestamp}`
    ).toString("base64");
    return password;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string,
    callbackUrl: string
  ): Promise<{
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  }> {
    const accessToken = await this.getAccessToken();
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
    const password = this.generatePassword();

    // Format phone number (remove + and ensure it starts with 254)
    const formattedPhone = phoneNumber.replace(/^\+/, "").replace(/^0/, "254");

    const payload = {
      BusinessShortCode: this.config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: this.config.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const response = await fetch(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`M-Pesa STK Push failed: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Verify callback signature (for security)
   */
  verifyCallbackSignature(
    body: string,
    signature: string
  ): boolean {
    // M-Pesa callback signature verification
    // This is a simplified version - implement according to M-Pesa docs
    const hash = crypto
      .createHash("sha256")
      .update(body)
      .digest("hex");
    return hash === signature;
  }
}

// Singleton instance
let mpesaService: MpesaService | null = null;

export function getMpesaService(): MpesaService {
  if (!mpesaService) {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const environment = (process.env.MPESA_ENVIRONMENT ||
      "sandbox") as "sandbox" | "production";

    // Only throw if we are actually trying to use the service in production or if needed
    // In build time, these env vars might not exist, which can crash the build if getMpesaService is called
    // We'll keep the check but ensure it doesn't run during static generation unless called
    if (!consumerKey || !consumerSecret || !businessShortCode || !passkey) {
      console.warn("M-Pesa configuration is missing. Payments will fail.");
    }

    mpesaService = new MpesaService({
      consumerKey: consumerKey || "",
      consumerSecret: consumerSecret || "",
      businessShortCode: businessShortCode || "",
      passkey: passkey || "",
      environment,
    });
  }

  return mpesaService;
}
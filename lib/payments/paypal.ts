import {
    Client,
    Environment,
    LogLevel,
    OrdersController,
    CheckoutPaymentIntent,
    OrderApplicationContextLandingPage,
    OrderApplicationContextUserAction,
} from "@paypal/paypal-server-sdk";

interface PayPalConfig {
    clientId: string;
    clientSecret: string;
    mode: "sandbox" | "live";
}

/**
 * Initialize PayPal client
 */
function initializePayPalClient() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = (process.env.PAYPAL_MODE || "sandbox") as "sandbox" | "live";

    if (!clientId || !clientSecret) {
        console.warn("PayPal configuration is missing. Payments will fail.");
        return null;
    }

    const environment =
        mode === "live" ? Environment.Production : Environment.Sandbox;

    const paypalClient = new Client({
        clientCredentialsAuthCredentials: {
            oAuthClientId: clientId,
            oAuthClientSecret: clientSecret,
        },
        environment,
        logging: {
            logLevel: LogLevel.Info,
        },
    });

    return paypalClient;
}

// Singleton instance
let paypalClientInstance: ReturnType<typeof initializePayPalClient> | null =
    null;

export function getPayPalClient() {
    if (!paypalClientInstance) {
        paypalClientInstance = initializePayPalClient();
    }
    return paypalClientInstance;
}

/**
 * Create a PayPal order
 */
const EXCHANGE_RATE = 130; // 1 USD = 130 KES (Fixed rate for MVP)

export async function createPayPalOrder(
    amount: number,
    currency: string = "KES", // Default input is KES
    orderReference: string,
    returnUrl: string,
    cancelUrl: string
) {
    const client = getPayPalClient();
    if (!client) {
        throw new Error("PayPal client not initialized");
    }

    // Convert KES to USD if currency is KES (PayPal doesn't support KES)
    let finalAmount = amount;
    let finalCurrency = currency;

    if (currency === "KES") {
        finalAmount = Number((amount / EXCHANGE_RATE).toFixed(2));
        finalCurrency = "USD";
    }

    const request = {
        body: {
            intent: CheckoutPaymentIntent.Capture,
            purchaseUnits: [
                {
                    referenceId: orderReference,
                    amount: {
                        currencyCode: finalCurrency,
                        value: finalAmount.toString(),
                    },
                },
            ],
            applicationContext: {
                returnUrl,
                cancelUrl,
                brandName: "JUA-KALI MULI TRADERS",
                landingPage: OrderApplicationContextLandingPage.Billing,
                userAction: OrderApplicationContextUserAction.PayNow,
            },
        },
    };

    const ordersApi = new OrdersController(client);
    const response = await ordersApi.createOrder(request);

    return response.result;
}

/**
 * Capture a PayPal order
 */
export async function capturePayPalOrder(paypalOrderId: string) {
    const client = getPayPalClient();
    if (!client) {
        throw new Error("PayPal client not initialized");
    }

    const request = {
        id: paypalOrderId,
        prefer: "return=representation",
    };

    const ordersApi = new OrdersController(client);
    const response = await ordersApi.captureOrder(request);

    return response.result;
}

/**
 * Get order details
 */
export async function getPayPalOrderDetails(paypalOrderId: string) {
    const client = getPayPalClient();
    if (!client) {
        throw new Error("PayPal client not initialized");
    }

    const request = {
        id: paypalOrderId,
    };

    const ordersApi = new OrdersController(client);
    const response = await ordersApi.getOrder(request);

    return response.result;
}

/**
 * Verify PayPal webhook signature
 * @param webhookId - Your PayPal webhook ID
 * @param headers - Request headers containing signature information
 * @param body - Raw request body
 */
export function verifyPayPalWebhook(
    webhookId: string,
    headers: {
        "paypal-transmission-id": string;
        "paypal-transmission-time": string;
        "paypal-transmission-sig": string;
        "paypal-cert-url": string;
        "paypal-auth-algo": string;
    },
    body: string
): boolean {
    // Note: PayPal Server SDK doesn't include webhook verification
    // For production, you should use a separate library or implement verification
    // For now, we'll log a warning
    console.warn(
        "Webhook signature verification not implemented. This should be added for production."
    );
    return true;
}

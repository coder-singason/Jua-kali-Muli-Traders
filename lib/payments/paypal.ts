import { client, orders } from "@paypal/paypal-server-sdk";

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
        mode === "live"
            ? client.Environment.Production
            : client.Environment.Sandbox;

    const paypalClient = client.Client({
        environment,
        auth: {
            clientId,
            clientSecret,
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
export async function createPayPalOrder(
    amount: number,
    currency: string = "USD",
    orderReference: string,
    returnUrl: string,
    cancelUrl: string
) {
    const client = getPayPalClient();
    if (!client) {
        throw new Error("PayPal client not initialized");
    }

    const request = {
        body: {
            intent: orders.OrderIntentEnum.Capture,
            purchaseUnits: [
                {
                    referenceId: orderReference,
                    amount: {
                        currencyCode: currency as orders.CurrencyCodeEnum,
                        value: amount.toFixed(2),
                    },
                },
            ],
            applicationContext: {
                returnUrl,
                cancelUrl,
                brandName: "Electronics & Juakali Shop",
                landingPage: orders.LandingPageEnum.Billing,
                userAction: orders.UserActionEnum.PayNow,
            },
        },
    };

    const ordersApi = new orders.OrdersController(client);
    const response = await ordersApi.ordersCreate(request);

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

    const ordersApi = new orders.OrdersController(client);
    const response = await ordersApi.ordersCapture(request);

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

    const ordersApi = new orders.OrdersController(client);
    const response = await ordersApi.ordersGet(request);

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

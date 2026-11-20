import type {
  OnlinePaymentDto,
  VerifyRidePaymentDto,
} from "@/store/api/generated/api";
type CheckoutInstance = {
  open(): void;
  on(event: "payment.failed", callback: (response: unknown) => void): void;
};
type CheckoutOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: VerifyRidePaymentDto) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
};
declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => CheckoutInstance;
  }
}
let loading: Promise<void> | undefined;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!loading)
    loading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) resolve();
        else {
          loading = undefined;
          script.remove();
          reject(
            new Error("Payment checkout is unavailable. Please try again."),
          );
        }
      };
      script.onerror = () => {
        loading = undefined;
        script.remove();
        reject(new Error("Payment checkout couldn’t load. Please try again."));
      };
      document.head.appendChild(script);
    });
  return loading;
}
export async function openCheckout(
  order: OnlinePaymentDto,
): Promise<VerifyRidePaymentDto | null> {
  await loadCheckout();
  if (!window.Razorpay) throw new Error("Payment checkout is unavailable.");
  const Constructor = window.Razorpay;
  return new Promise((resolve, reject) => {
    const checkout = new Constructor({
      key: order.razorpay.key_id,
      order_id: order.razorpay.order_id,
      amount: Number(order.razorpay.amount),
      currency: order.razorpay.currency,
      name: "Safar Cabs",
      description: "Your Safar journey",
      handler: resolve,
      modal: { ondismiss: () => resolve(null) },
      theme: { color: "#EA580C" },
    });
    checkout.on("payment.failed", () =>
      reject(
        new Error(
          "Your payment didn’t go through. You can retry this booking.",
        ),
      ),
    );
    checkout.open();
  });
}

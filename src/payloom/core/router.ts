import { RazorpayAdapter } from "@/payloom/adapters/razorpay";
import { payloomConfig } from "@/payloom/core/config";
import { PayloomConfigError } from "@/payloom/core/errors";
import type { PaymentProviderAdapter } from "@/payloom/core/contracts";

export const getPaymentProvider = () => payloomConfig.paymentProvider;

export const getPayloomEnvironment = () => payloomConfig.environment;

export const getPaymentAdapter = (): PaymentProviderAdapter => {
	if (payloomConfig.paymentProvider === "razorpay") {
		return new RazorpayAdapter();
	}

	throw new PayloomConfigError("No payment adapter configured for this provider.");
};

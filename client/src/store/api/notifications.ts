import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { showNotification } from "@/components/ui/notifications";
import { apiErrorMessage } from "@/features/auth/api-error";

const successMessages: Record<string, string> = {
  ridesControllerCreate: "Your booking is saved.",
  adminCabsControllerUpdate: "Cab category saved.",
  authControllerRegister:
    "Account created. Check your email for the verification code.",
  authControllerLogin: "You’re logged in. Welcome to Safar!",
  authControllerVerifyOtp: "Email verified successfully.",
  authControllerResendOtp: "Verification code requested. Check your email.",
  authControllerLogout: "You’ve been logged out.",
  authControllerUpdateProfile: "Your profile has been updated.",
  authControllerChooseRole: "Your account role has been updated.",
  authControllerChangePassword: "Password changed. Please log in again.",
  authControllerForgotPassword:
    "Password reset requested. Check your email for next steps.",
  authControllerResetPassword: "Password reset. You can now log in.",
  driversControllerUpsertBankDetails: "Bank details saved.",
  driversControllerSubmit: "Your driver application has been submitted.",
  adminDriversControllerReviewDocument: "Document review saved.",
  adminDriversControllerReviewVehicleDocument: "Vehicle document review saved.",
  adminDriversControllerReviewProfile: "Driver profile review saved.",
  adminDriversControllerRequestCorrections: "Correction request sent.",
  adminDriversControllerSuspend: "Driver suspended.",
  driverRidesControllerAccept: "Ride accepted.",
  driverRidesControllerReject: "Ride declined.",
  driverRidesControllerStart: "Ride started.",
  driverRidesControllerComplete: "Ride completed.",
  adminRidesControllerAssign: "Driver assigned to the ride.",
  adminRidesControllerRevoke: "Driver assignment revoked.",
  adminRidesControllerComplete: "Ride completed.",
  adminRidesControllerCancel: "Ride cancelled.",
  adminRidesControllerUpdateStatus: "Ride status updated.",
  adminRidesControllerMarkOfflinePaid: "Offline payment recorded.",
  mediaControllerDeleteImage: "Photo removed.",
};

/** Report errors and explicitly selected successes; all other requests stay quiet. */
export function notifyApiResult(
  result: { data?: unknown; error?: FetchBaseQueryError },
  endpoint: string,
): void {
  if (typeof window === "undefined") return;
  if (result.error) {
    showNotification("danger", apiErrorMessage(result.error));
    return;
  }
  if (Object.hasOwn(successMessages, endpoint)) {
    showNotification("success", successMessages[endpoint]);
  }
}

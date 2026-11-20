import type { RideResponseDto } from "@/store/api/generated/api";

export const vehicleCategoryLabels: Record<
  RideResponseDto["requested_vehicle_category"],
  string
> = {
  SEATER_4: "4-seater cab",
  SEATER_5: "5-seater cab",
  SEATER_7: "7-seater cab",
  SEATER_12: "12-seater cab",
};

export const bookingStatusLabels: Record<RideResponseDto["status"], string> = {
  PENDING_PAYMENT: "Payment pending",
  PAYMENT_FAILED: "Payment failed",
  PENDING_ASSIGNMENT: "Awaiting driver",
  DRIVER_ASSIGNED: "Driver assigned",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
export const bookingPaymentLabels: Record<
  RideResponseDto["payment_option"],
  string
> = {
  ONLINE: "Online payment",
  PARTIAL: "Online advance + offline balance",
  OFFLINE: "Pay offline",
};

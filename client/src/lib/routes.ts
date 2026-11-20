export const routes = {
  home: "/",
  driver: "/driver",
  admin: "/admin",
  adminVerifications: "/admin/verifications",
  adminVehicles: "/admin/vehicles",
  adminUsers: "/admin/users",
  adminPayments: "/admin/payments",
  adminDrivers: "/admin/drivers",
  adminRides: "/admin/rides",
  about: "/about",
  login: "/login",
  signup: "/signup",
  profile: "/profile",
  bookings: "/bookings",
  bookingCabs: "/booking/cabs",
  bookingPreview: "/booking/preview",
  adminCabs: "/admin/cabs",
} as const;

export function accountHome(role: string | null | undefined) {
  return role === "Driver"
    ? routes.driver
    : role === "Admin"
      ? routes.admin
      : routes.profile;
}

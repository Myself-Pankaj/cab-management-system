import { generatedApi } from "./generated/api";

export const api = generatedApi.enhanceEndpoints({
  addTagTypes: [
    "AdminSummary",
    "AdminUsers",
    "AdminVehicles",
    "AdminPayments",
    "CurrentUser",
    "CabCatalog",
    "Ride",
    "Onboarding",
    "DriverReview",
  ],
  endpoints: {
    adminReportingControllerSummary: { providesTags: ["AdminSummary"] },
    adminReportingControllerUsers: { providesTags: ["AdminUsers"] },
    adminReportingControllerUser: { providesTags: ["AdminUsers"] },
    adminReportingControllerVehicle: { providesTags: ["AdminVehicles"] },
    adminReportingControllerPayment: {
      providesTags: ["AdminPayments", "Ride"],
    },
    adminReportingControllerUpdateVehicle: {
      invalidatesTags: [
        "AdminVehicles",
        "AdminSummary",
        "DriverReview",
        "Onboarding",
        "Ride",
      ],
    },
    adminDriversControllerCorrectDocument: {
      invalidatesTags: [
        "DriverReview",
        "Onboarding",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerCorrectVehicleDocument: {
      invalidatesTags: [
        "DriverReview",
        "Onboarding",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminReportingControllerVehicles: { providesTags: ["AdminVehicles"] },
    adminReportingControllerPayments: { providesTags: ["AdminPayments"] },
    adminReportingControllerApplications: { providesTags: ["DriverReview"] },
    driversControllerGetOnboarding: { providesTags: ["Onboarding"] },
    driversControllerGetProfile: { providesTags: ["Onboarding"] },
    driversControllerListDocuments: { providesTags: ["Onboarding"] },
    driversControllerListVehicles: { providesTags: ["Onboarding"] },
    driverRidesControllerList: { providesTags: ["Ride"] },
    driverRidesControllerDetail: { providesTags: ["Ride"] },
    adminDriversControllerListDrivers: { providesTags: ["DriverReview"] },
    adminDriversControllerListPending: { providesTags: ["DriverReview"] },
    adminDriversControllerGetDriverDetails: { providesTags: ["DriverReview"] },
    adminRidesControllerList: { providesTags: ["Ride"] },
    adminRidesControllerGetDetail: { providesTags: ["Ride"] },
    adminRidesControllerEligible: { providesTags: ["Ride"] },
    driversControllerAddVehicle: {
      invalidatesTags: ["Onboarding", "AdminVehicles", "AdminSummary"],
    },
    driversControllerUpdateVehicle: {
      invalidatesTags: ["Onboarding", "AdminVehicles", "AdminSummary"],
    },
    driversControllerAddDocument: {
      invalidatesTags: ["Onboarding", "AdminVehicles", "AdminSummary"],
    },
    driversControllerAddVehicleDocument: {
      invalidatesTags: ["Onboarding", "AdminVehicles", "AdminSummary"],
    },
    driversControllerUpdateDocument: {
      invalidatesTags: ["Onboarding", "AdminVehicles", "AdminSummary"],
    },
    driversControllerUpdateVehicleDocument: {
      invalidatesTags: ["Onboarding", "AdminVehicles", "AdminSummary"],
    },
    driversControllerSubmit: {
      invalidatesTags: [
        "Ride",
        "Onboarding",
        "DriverReview",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    mediaControllerUploadDocument: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    mediaControllerUploadVehiclePhoto: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    mediaControllerDeleteImage: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerReviewVehicle: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerReviewDocument: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerReviewVehicleDocument: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerReviewProfile: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerRequestCorrections: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    adminDriversControllerSuspend: {
      invalidatesTags: [
        "Onboarding",
        "DriverReview",
        "Ride",
        "AdminSummary",
        "AdminVehicles",
      ],
    },
    driverRidesControllerAccept: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    driverRidesControllerReject: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    driverRidesControllerStart: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    driverRidesControllerComplete: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    adminRidesControllerAssign: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    adminRidesControllerRevoke: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    adminRidesControllerComplete: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    adminRidesControllerCancel: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    adminRidesControllerUpdateStatus: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    adminCabsControllerList: { providesTags: ["CabCatalog"] },
    adminCabsControllerUpdate: { invalidatesTags: ["CabCatalog"] },
    ridesControllerListVehicleCategories: { providesTags: ["CabCatalog"] },
    ridesControllerGetMine: {
      providesTags: (_result, _error, args) => [{ type: "Ride", id: args.id }],
    },
    ridesControllerListMine: {
      providesTags: (result) => [
        "Ride",
        ...(result?.data.rides.map((ride) => ({
          type: "Ride" as const,
          id: ride.id,
        })) ?? []),
      ],
    },
    ridesControllerCreate: {
      invalidatesTags: ["Ride", "AdminSummary", "AdminPayments"],
    },
    ridesControllerVerifyPayment: {
      invalidatesTags: (_result, _error, args) => [
        { type: "Ride", id: args.id },
        "AdminSummary",
        "AdminPayments",
      ],
    },
    authControllerGetProfile: { providesTags: ["CurrentUser"] },
    authControllerUpdateProfile: {
      invalidatesTags: ["CurrentUser", "AdminUsers", "AdminSummary"],
    },
    authControllerChooseRole: {
      invalidatesTags: ["CurrentUser", "AdminUsers", "AdminSummary"],
    },
    authControllerChangePassword: {
      invalidatesTags: ["CurrentUser", "AdminUsers", "AdminSummary"],
    },
  },
});
export const {
  useAuthControllerLoginMutation: useLoginMutation,
  useAuthControllerRegisterMutation: useRegisterMutation,
  useAuthControllerVerifyOtpMutation: useVerifyOtpMutation,
  useAuthControllerResendOtpMutation: useResendOtpMutation,
  useAuthControllerLogoutMutation: useLogoutMutation,
  useAuthControllerGetProfileQuery: useProfileQuery,
  useLazyAuthControllerGetProfileQuery: useLazyProfileQuery,
} = api;

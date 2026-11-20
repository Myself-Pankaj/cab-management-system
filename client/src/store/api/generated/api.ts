import { baseApi as api } from "../base-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    healthControllerLiveness: build.query<
      HealthControllerLivenessApiResponse,
      HealthControllerLivenessApiArg
    >({
      query: () => ({ url: `/api/v1/health` }),
    }),
    healthControllerReadiness: build.query<
      HealthControllerReadinessApiResponse,
      HealthControllerReadinessApiArg
    >({
      query: () => ({ url: `/api/v1/health/ready` }),
    }),
    authControllerRegister: build.mutation<
      AuthControllerRegisterApiResponse,
      AuthControllerRegisterApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/register`,
        method: "POST",
        body: queryArg.registerDto,
      }),
    }),
    authControllerVerifyOtp: build.mutation<
      AuthControllerVerifyOtpApiResponse,
      AuthControllerVerifyOtpApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/verify-otp`,
        method: "POST",
        body: queryArg.verifyOtpDto,
      }),
    }),
    authControllerResendOtp: build.mutation<
      AuthControllerResendOtpApiResponse,
      AuthControllerResendOtpApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/resend-otp`,
        method: "POST",
        body: queryArg.resendOtpDto,
      }),
    }),
    authControllerLogin: build.mutation<
      AuthControllerLoginApiResponse,
      AuthControllerLoginApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/login`,
        method: "POST",
        body: queryArg.loginDto,
      }),
    }),
    authControllerRefresh: build.mutation<
      AuthControllerRefreshApiResponse,
      AuthControllerRefreshApiArg
    >({
      query: () => ({ url: `/api/v1/auth/refresh`, method: "POST" }),
    }),
    authControllerLogout: build.mutation<
      AuthControllerLogoutApiResponse,
      AuthControllerLogoutApiArg
    >({
      query: () => ({ url: `/api/v1/auth/logout`, method: "POST" }),
    }),
    authControllerForgotPassword: build.mutation<
      AuthControllerForgotPasswordApiResponse,
      AuthControllerForgotPasswordApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/forgot-password`,
        method: "POST",
        body: queryArg.forgotPasswordDto,
      }),
    }),
    authControllerResetPassword: build.mutation<
      AuthControllerResetPasswordApiResponse,
      AuthControllerResetPasswordApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/reset-password`,
        method: "POST",
        body: queryArg.resetPasswordDto,
      }),
    }),
    authControllerChooseRole: build.mutation<
      AuthControllerChooseRoleApiResponse,
      AuthControllerChooseRoleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/choose-role`,
        method: "POST",
        body: queryArg.chooseRoleDto,
      }),
    }),
    authControllerGetProfile: build.query<
      AuthControllerGetProfileApiResponse,
      AuthControllerGetProfileApiArg
    >({
      query: () => ({ url: `/api/v1/auth/profile` }),
    }),
    authControllerUpdateProfile: build.mutation<
      AuthControllerUpdateProfileApiResponse,
      AuthControllerUpdateProfileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/profile`,
        method: "PATCH",
        body: queryArg.updateProfileDto,
      }),
    }),
    authControllerChangePassword: build.mutation<
      AuthControllerChangePasswordApiResponse,
      AuthControllerChangePasswordApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/auth/change-password`,
        method: "POST",
        body: queryArg.changePasswordDto,
      }),
    }),
    driversControllerGetOnboarding: build.query<
      DriversControllerGetOnboardingApiResponse,
      DriversControllerGetOnboardingApiArg
    >({
      query: () => ({ url: `/api/v1/drivers/me/onboarding` }),
    }),
    driversControllerUpdateDocument: build.mutation<
      DriversControllerUpdateDocumentApiResponse,
      DriversControllerUpdateDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/documents/${queryArg.documentId}`,
        method: "PATCH",
        body: queryArg.createDriverDocumentDto,
      }),
    }),
    driversControllerUpdateVehicle: build.mutation<
      DriversControllerUpdateVehicleApiResponse,
      DriversControllerUpdateVehicleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/vehicles/${queryArg.vehicleId}`,
        method: "PATCH",
        body: queryArg.createDriverVehicleDto,
      }),
    }),
    driversControllerUpdateVehicleDocument: build.mutation<
      DriversControllerUpdateVehicleDocumentApiResponse,
      DriversControllerUpdateVehicleDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/vehicles/${queryArg.vehicleId}/documents/${queryArg.documentId}`,
        method: "PATCH",
        body: queryArg.createVehicleDocumentDto,
      }),
    }),
    driversControllerGetProfile: build.query<
      DriversControllerGetProfileApiResponse,
      DriversControllerGetProfileApiArg
    >({
      query: () => ({ url: `/api/v1/drivers/me/profile` }),
    }),
    driversControllerAddDocument: build.mutation<
      DriversControllerAddDocumentApiResponse,
      DriversControllerAddDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/documents`,
        method: "POST",
        body: queryArg.createDriverDocumentDto,
      }),
    }),
    driversControllerListDocuments: build.query<
      DriversControllerListDocumentsApiResponse,
      DriversControllerListDocumentsApiArg
    >({
      query: () => ({ url: `/api/v1/drivers/me/documents` }),
    }),
    driversControllerUpsertBankDetails: build.mutation<
      DriversControllerUpsertBankDetailsApiResponse,
      DriversControllerUpsertBankDetailsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/bank-details`,
        method: "PUT",
        body: queryArg.upsertBankDetailsDto,
      }),
    }),
    driversControllerGetBankDetails: build.query<
      DriversControllerGetBankDetailsApiResponse,
      DriversControllerGetBankDetailsApiArg
    >({
      query: () => ({ url: `/api/v1/drivers/me/bank-details` }),
    }),
    driversControllerAddVehicle: build.mutation<
      DriversControllerAddVehicleApiResponse,
      DriversControllerAddVehicleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/vehicles`,
        method: "POST",
        body: queryArg.createDriverVehicleDto,
      }),
    }),
    driversControllerListVehicles: build.query<
      DriversControllerListVehiclesApiResponse,
      DriversControllerListVehiclesApiArg
    >({
      query: () => ({ url: `/api/v1/drivers/me/vehicles` }),
    }),
    driversControllerAddVehicleDocument: build.mutation<
      DriversControllerAddVehicleDocumentApiResponse,
      DriversControllerAddVehicleDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/vehicles/${queryArg.vehicleId}/documents`,
        method: "POST",
        body: queryArg.createVehicleDocumentDto,
      }),
    }),
    driversControllerSubmit: build.mutation<
      DriversControllerSubmitApiResponse,
      DriversControllerSubmitApiArg
    >({
      query: () => ({ url: `/api/v1/drivers/me/submit`, method: "POST" }),
    }),
    driverRidesControllerList: build.query<
      DriverRidesControllerListApiResponse,
      DriverRidesControllerListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/rides`,
        params: {
          view: queryArg.view,
          limit: queryArg.limit,
          offset: queryArg.offset,
        },
      }),
    }),
    driverRidesControllerDetail: build.query<
      DriverRidesControllerDetailApiResponse,
      DriverRidesControllerDetailApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/drivers/me/rides/${queryArg.id}` }),
    }),
    driverRidesControllerAccept: build.mutation<
      DriverRidesControllerAcceptApiResponse,
      DriverRidesControllerAcceptApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/offers/${queryArg.id}/accept`,
        method: "POST",
      }),
    }),
    driverRidesControllerReject: build.mutation<
      DriverRidesControllerRejectApiResponse,
      DriverRidesControllerRejectApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/offers/${queryArg.id}/reject`,
        method: "POST",
        body: queryArg.offerReasonDto,
      }),
    }),
    driverRidesControllerStart: build.mutation<
      DriverRidesControllerStartApiResponse,
      DriverRidesControllerStartApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/rides/${queryArg.id}/start`,
        method: "POST",
      }),
    }),
    driverRidesControllerComplete: build.mutation<
      DriverRidesControllerCompleteApiResponse,
      DriverRidesControllerCompleteApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/drivers/me/rides/${queryArg.id}/complete`,
        method: "POST",
        body: queryArg.completeDriverRideDto,
      }),
    }),
    adminDriversControllerListDrivers: build.query<
      AdminDriversControllerListDriversApiResponse,
      AdminDriversControllerListDriversApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          state: queryArg.state,
        },
      }),
    }),
    adminDriversControllerRequestCorrections: build.mutation<
      AdminDriversControllerRequestCorrectionsApiResponse,
      AdminDriversControllerRequestCorrectionsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/${queryArg.profileId}/request-corrections`,
        method: "POST",
        body: queryArg.suspendDriverDto,
      }),
    }),
    adminDriversControllerSuspend: build.mutation<
      AdminDriversControllerSuspendApiResponse,
      AdminDriversControllerSuspendApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/${queryArg.profileId}/suspend`,
        method: "POST",
        body: queryArg.suspendDriverDto,
      }),
    }),
    adminDriversControllerReviewVehicle: build.mutation<
      AdminDriversControllerReviewVehicleApiResponse,
      AdminDriversControllerReviewVehicleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/vehicles/${queryArg.vehicleId}/review`,
        method: "POST",
        body: queryArg.reviewVehicleDto,
      }),
    }),
    adminDriversControllerReviewVehicleDocument: build.mutation<
      AdminDriversControllerReviewVehicleDocumentApiResponse,
      AdminDriversControllerReviewVehicleDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/vehicle-documents/${queryArg.documentId}/review`,
        method: "POST",
        body: queryArg.reviewDocumentDto,
      }),
    }),
    adminDriversControllerCorrectDocument: build.mutation<
      AdminDriversControllerCorrectDocumentApiResponse,
      AdminDriversControllerCorrectDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/documents/${queryArg.documentId}/correct`,
        method: "POST",
        body: queryArg.adminDocumentEditDto,
      }),
    }),
    adminDriversControllerCorrectVehicleDocument: build.mutation<
      AdminDriversControllerCorrectVehicleDocumentApiResponse,
      AdminDriversControllerCorrectVehicleDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/vehicle-documents/${queryArg.documentId}/correct`,
        method: "POST",
        body: queryArg.adminDocumentEditDto,
      }),
    }),
    adminDriversControllerListPending: build.query<
      AdminDriversControllerListPendingApiResponse,
      AdminDriversControllerListPendingApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/pending`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          state: queryArg.state,
        },
      }),
    }),
    adminDriversControllerGetDriverDetails: build.query<
      AdminDriversControllerGetDriverDetailsApiResponse,
      AdminDriversControllerGetDriverDetailsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/${queryArg.profileId}`,
      }),
    }),
    adminDriversControllerReviewProfile: build.mutation<
      AdminDriversControllerReviewProfileApiResponse,
      AdminDriversControllerReviewProfileApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/${queryArg.profileId}/review`,
        method: "POST",
        body: queryArg.reviewDriverDto,
      }),
    }),
    adminDriversControllerReviewDocument: build.mutation<
      AdminDriversControllerReviewDocumentApiResponse,
      AdminDriversControllerReviewDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/drivers/documents/${queryArg.documentId}/review`,
        method: "POST",
        body: queryArg.reviewDocumentDto,
      }),
    }),
    adminReportingControllerSummary: build.query<
      AdminReportingControllerSummaryApiResponse,
      AdminReportingControllerSummaryApiArg
    >({
      query: () => ({ url: `/api/v1/admin/dashboard/summary` }),
    }),
    adminReportingControllerUsers: build.query<
      AdminReportingControllerUsersApiResponse,
      AdminReportingControllerUsersApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/users`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          role: queryArg.role,
          accountStatus: queryArg.accountStatus,
        },
      }),
    }),
    adminReportingControllerUser: build.query<
      AdminReportingControllerUserApiResponse,
      AdminReportingControllerUserApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/admin/users/${queryArg.id}` }),
    }),
    adminReportingControllerVehicles: build.query<
      AdminReportingControllerVehiclesApiResponse,
      AdminReportingControllerVehiclesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/vehicles`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          activity: queryArg.activity,
          category: queryArg.category,
        },
      }),
    }),
    adminReportingControllerVehicle: build.query<
      AdminReportingControllerVehicleApiResponse,
      AdminReportingControllerVehicleApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/admin/vehicles/${queryArg.id}` }),
    }),
    adminReportingControllerUpdateVehicle: build.mutation<
      AdminReportingControllerUpdateVehicleApiResponse,
      AdminReportingControllerUpdateVehicleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/vehicles/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.adminVehicleEditDto,
      }),
    }),
    adminReportingControllerPayment: build.query<
      AdminReportingControllerPaymentApiResponse,
      AdminReportingControllerPaymentApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/admin/payments/${queryArg.id}` }),
    }),
    adminReportingControllerPayments: build.query<
      AdminReportingControllerPaymentsApiResponse,
      AdminReportingControllerPaymentsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/payments`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          status: queryArg.status,
          paymentType: queryArg.paymentType,
          dateFrom: queryArg.dateFrom,
          dateTo: queryArg.dateTo,
        },
      }),
    }),
    adminReportingControllerApplications: build.query<
      AdminReportingControllerApplicationsApiResponse,
      AdminReportingControllerApplicationsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/verifications`,
        params: {
          limit: queryArg.limit,
          offset: queryArg.offset,
          search: queryArg.search,
          state: queryArg.state,
        },
      }),
    }),
    adminRidesControllerEligible: build.query<
      AdminRidesControllerEligibleApiResponse,
      AdminRidesControllerEligibleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/eligible-drivers`,
      }),
    }),
    adminRidesControllerRevoke: build.mutation<
      AdminRidesControllerRevokeApiResponse,
      AdminRidesControllerRevokeApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/offers/${queryArg.offerId}/revoke`,
        method: "POST",
        body: queryArg.adminOfferReasonDto,
      }),
    }),
    adminRidesControllerComplete: build.mutation<
      AdminRidesControllerCompleteApiResponse,
      AdminRidesControllerCompleteApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/complete`,
        method: "POST",
        body: queryArg.completeDriverRideDto,
      }),
    }),
    adminRidesControllerList: build.query<
      AdminRidesControllerListApiResponse,
      AdminRidesControllerListApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides`,
        params: {
          status: queryArg.status,
          limit: queryArg.limit,
          offset: queryArg.offset,
          userId: queryArg.userId,
          driverProfileId: queryArg.driverProfileId,
          view: queryArg.view,
          category: queryArg.category,
        },
      }),
    }),
    adminRidesControllerGetDetail: build.query<
      AdminRidesControllerGetDetailApiResponse,
      AdminRidesControllerGetDetailApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/admin/rides/${queryArg.id}` }),
    }),
    adminRidesControllerAssign: build.mutation<
      AdminRidesControllerAssignApiResponse,
      AdminRidesControllerAssignApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/assign`,
        method: "POST",
        body: queryArg.assignRideDto,
      }),
    }),
    adminRidesControllerCancel: build.mutation<
      AdminRidesControllerCancelApiResponse,
      AdminRidesControllerCancelApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/cancel`,
        method: "POST",
        body: queryArg.cancelRideDto,
      }),
    }),
    adminRidesControllerUpdateStatus: build.mutation<
      AdminRidesControllerUpdateStatusApiResponse,
      AdminRidesControllerUpdateStatusApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/status`,
        method: "POST",
        body: queryArg.updateRideStatusDto,
      }),
    }),
    adminRidesControllerMarkOfflinePaid: build.mutation<
      AdminRidesControllerMarkOfflinePaidApiResponse,
      AdminRidesControllerMarkOfflinePaidApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/rides/${queryArg.id}/payments/${queryArg.paymentId}/mark-paid`,
        method: "POST",
      }),
    }),
    adminCabsControllerList: build.query<
      AdminCabsControllerListApiResponse,
      AdminCabsControllerListApiArg
    >({
      query: () => ({ url: `/api/v1/admin/cabs` }),
    }),
    adminCabsControllerUpdate: build.mutation<
      AdminCabsControllerUpdateApiResponse,
      AdminCabsControllerUpdateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/admin/cabs/${queryArg.category}`,
        method: "PUT",
        body: queryArg.updateCabCategoryDto,
      }),
    }),
    mediaControllerUploadVehiclePhoto: build.mutation<
      MediaControllerUploadVehiclePhotoApiResponse,
      MediaControllerUploadVehiclePhotoApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/media/vehicles/${queryArg.vehicleId}/photos`,
        method: "POST",
        body: queryArg.uploadVehiclePhotoDto,
      }),
    }),
    mediaControllerUploadDocument: build.mutation<
      MediaControllerUploadDocumentApiResponse,
      MediaControllerUploadDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/media/documents/upload`,
        method: "POST",
        body: queryArg.uploadDocumentDto,
      }),
    }),
    mediaControllerViewDocument: build.query<
      MediaControllerViewDocumentApiResponse,
      MediaControllerViewDocumentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/media/documents/${queryArg.id}/content`,
        params: {
          download: queryArg.download,
        },
      }),
    }),
    mediaControllerGetUploadAuth: build.query<
      MediaControllerGetUploadAuthApiResponse,
      MediaControllerGetUploadAuthApiArg
    >({
      query: () => ({ url: `/api/v1/media/upload-auth` }),
    }),
    mediaControllerRegisterImage: build.mutation<
      MediaControllerRegisterImageApiResponse,
      MediaControllerRegisterImageApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/media`,
        method: "POST",
        body: queryArg.registerImageDto,
      }),
    }),
    mediaControllerListImages: build.query<
      MediaControllerListImagesApiResponse,
      MediaControllerListImagesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/media`,
        params: {
          owner_id: queryArg.ownerId,
          owner_type: queryArg.ownerType,
        },
      }),
    }),
    mediaControllerDeleteImage: build.mutation<
      MediaControllerDeleteImageApiResponse,
      MediaControllerDeleteImageApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/media/${queryArg.id}`,
        method: "DELETE",
        params: {
          expected_revision: queryArg.expectedRevision,
        },
      }),
    }),
    ridesControllerLocations: build.query<
      RidesControllerLocationsApiResponse,
      RidesControllerLocationsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides/locations`,
        params: {
          text: queryArg.text,
        },
      }),
    }),
    ridesControllerListVehicleCategories: build.query<
      RidesControllerListVehicleCategoriesApiResponse,
      RidesControllerListVehicleCategoriesApiArg
    >({
      query: () => ({ url: `/api/v1/rides/vehicle-categories` }),
    }),
    ridesControllerEstimates: build.mutation<
      RidesControllerEstimatesApiResponse,
      RidesControllerEstimatesApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides/estimates`,
        method: "POST",
        body: queryArg.rideEstimateDto,
      }),
    }),
    ridesControllerVerifyPayment: build.mutation<
      RidesControllerVerifyPaymentApiResponse,
      RidesControllerVerifyPaymentApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides/${queryArg.id}/verify-payment`,
        method: "POST",
        body: queryArg.verifyRidePaymentDto,
      }),
    }),
    ridesControllerQuote: build.mutation<
      RidesControllerQuoteApiResponse,
      RidesControllerQuoteApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides/quote`,
        method: "POST",
        body: queryArg.rideQuoteDto,
      }),
    }),
    ridesControllerCreate: build.mutation<
      RidesControllerCreateApiResponse,
      RidesControllerCreateApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides`,
        method: "POST",
        body: queryArg.createRideDto,
      }),
    }),
    ridesControllerListMine: build.query<
      RidesControllerListMineApiResponse,
      RidesControllerListMineApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides/me`,
        params: {
          status: queryArg.status,
          limit: queryArg.limit,
          offset: queryArg.offset,
          view: queryArg.view,
        },
      }),
    }),
    ridesControllerGetMine: build.query<
      RidesControllerGetMineApiResponse,
      RidesControllerGetMineApiArg
    >({
      query: (queryArg) => ({ url: `/api/v1/rides/me/${queryArg.id}` }),
    }),
    ridesControllerPayOnline: build.mutation<
      RidesControllerPayOnlineApiResponse,
      RidesControllerPayOnlineApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/rides/${queryArg.id}/pay-online`,
        method: "POST",
      }),
    }),
    razorpayWebhookControllerHandle: build.mutation<
      RazorpayWebhookControllerHandleApiResponse,
      RazorpayWebhookControllerHandleApiArg
    >({
      query: (queryArg) => ({
        url: `/api/v1/webhooks/razorpay`,
        method: "POST",
        headers: {
          "x-razorpay-signature": queryArg["x-razorpay-signature"],
          "x-razorpay-event-id": queryArg["x-razorpay-event-id"],
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as generatedApi };
export type HealthControllerLivenessApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: LivenessDto;
  timestamp: string;
  path: string;
};
export type HealthControllerLivenessApiArg = void;
export type HealthControllerReadinessApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: ReadinessDto;
  timestamp: string;
  path: string;
};
export type HealthControllerReadinessApiArg = void;
export type AuthControllerRegisterApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: RegistrationResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerRegisterApiArg = {
  registerDto: RegisterDto;
};
export type AuthControllerVerifyOtpApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: UserDataDto;
  timestamp: string;
  path: string;
};
export type AuthControllerVerifyOtpApiArg = {
  verifyOtpDto: VerifyOtpDto;
};
export type AuthControllerResendOtpApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: OtpMessageResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerResendOtpApiArg = {
  resendOtpDto: ResendOtpDto;
};
export type AuthControllerLoginApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AuthSessionResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerLoginApiArg = {
  loginDto: LoginDto;
};
export type AuthControllerRefreshApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RefreshSessionResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerRefreshApiArg = void;
export type AuthControllerLogoutApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: MessageResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerLogoutApiArg = void;
export type AuthControllerForgotPasswordApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: OtpMessageResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerForgotPasswordApiArg = {
  forgotPasswordDto: ForgotPasswordDto;
};
export type AuthControllerResetPasswordApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: MessageResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerResetPasswordApiArg = {
  resetPasswordDto: ResetPasswordDto;
};
export type AuthControllerChooseRoleApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: UserDataDto;
  timestamp: string;
  path: string;
};
export type AuthControllerChooseRoleApiArg = {
  chooseRoleDto: ChooseRoleDto;
};
export type AuthControllerGetProfileApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: UserDataDto;
  timestamp: string;
  path: string;
};
export type AuthControllerGetProfileApiArg = void;
export type AuthControllerUpdateProfileApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: UserDataDto;
  timestamp: string;
  path: string;
};
export type AuthControllerUpdateProfileApiArg = {
  updateProfileDto: UpdateProfileDto;
};
export type AuthControllerChangePasswordApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: MessageResponseDto;
  timestamp: string;
  path: string;
};
export type AuthControllerChangePasswordApiArg = {
  changePasswordDto: ChangePasswordDto;
};
export type DriversControllerGetOnboardingApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverOnboardingDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerGetOnboardingApiArg = void;
export type DriversControllerUpdateDocumentApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DocumentCreatedDto;
  timestamp: string;
  path: string;
};
export type DriversControllerUpdateDocumentApiArg = {
  documentId: string;
  createDriverDocumentDto: CreateDriverDocumentDto;
};
export type DriversControllerUpdateVehicleApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: VehicleDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerUpdateVehicleApiArg = {
  vehicleId: string;
  createDriverVehicleDto: CreateDriverVehicleDto;
};
export type DriversControllerUpdateVehicleDocumentApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: VehicleDocumentCreatedDto;
    timestamp: string;
    path: string;
  };
export type DriversControllerUpdateVehicleDocumentApiArg = {
  vehicleId: string;
  documentId: string;
  createVehicleDocumentDto: CreateVehicleDocumentDto;
};
export type DriversControllerGetProfileApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverProfileDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerGetProfileApiArg = void;
export type DriversControllerAddDocumentApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: DocumentCreatedDto;
  timestamp: string;
  path: string;
};
export type DriversControllerAddDocumentApiArg = {
  createDriverDocumentDto: CreateDriverDocumentDto;
};
export type DriversControllerListDocumentsApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DocumentsDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerListDocumentsApiArg = void;
export type DriversControllerUpsertBankDetailsApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: BankAccountSavedDto;
  timestamp: string;
  path: string;
};
export type DriversControllerUpsertBankDetailsApiArg = {
  upsertBankDetailsDto: UpsertBankDetailsDto;
};
export type DriversControllerGetBankDetailsApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: BankAccountDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerGetBankDetailsApiArg = void;
export type DriversControllerAddVehicleApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: VehicleDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerAddVehicleApiArg = {
  createDriverVehicleDto: CreateDriverVehicleDto;
};
export type DriversControllerListVehiclesApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: VehiclesDataDto;
  timestamp: string;
  path: string;
};
export type DriversControllerListVehiclesApiArg = void;
export type DriversControllerAddVehicleDocumentApiResponse =
  /** status 201  */ {
    success: true;
    message: string;
    data: VehicleDocumentCreatedDto;
    timestamp: string;
    path: string;
  };
export type DriversControllerAddVehicleDocumentApiArg = {
  vehicleId: string;
  createVehicleDocumentDto: CreateVehicleDocumentDto;
};
export type DriversControllerSubmitApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverSubmittedDto;
  timestamp: string;
  path: string;
};
export type DriversControllerSubmitApiArg = void;
export type DriverRidesControllerListApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverOffersDto;
  timestamp: string;
  path: string;
};
export type DriverRidesControllerListApiArg = {
  view?:
    "assigned" | "active" | "completed" | "cancelled" | "rejected" | "history";
  limit?: number;
  offset?: number;
};
export type DriverRidesControllerDetailApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverRideDetailDto;
  timestamp: string;
  path: string;
};
export type DriverRidesControllerDetailApiArg = {
  id: string;
};
export type DriverRidesControllerAcceptApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: OfferResultDto;
  timestamp: string;
  path: string;
};
export type DriverRidesControllerAcceptApiArg = {
  id: string;
};
export type DriverRidesControllerRejectApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: OfferResultDto;
  timestamp: string;
  path: string;
};
export type DriverRidesControllerRejectApiArg = {
  id: string;
  offerReasonDto: OfferReasonDto;
};
export type DriverRidesControllerStartApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverRideDetailDto;
  timestamp: string;
  path: string;
};
export type DriverRidesControllerStartApiArg = {
  id: string;
};
export type DriverRidesControllerCompleteApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverRideDetailDto;
  timestamp: string;
  path: string;
};
export type DriverRidesControllerCompleteApiArg = {
  id: string;
  completeDriverRideDto: CompleteDriverRideDto;
};
export type AdminDriversControllerListDriversApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminApplicationsPageDto;
  timestamp: string;
  path: string;
};
export type AdminDriversControllerListDriversApiArg = {
  limit?: number;
  offset?: number;
  search?: string;
  state?:
    | "DRAFT"
    | "PENDING_VERIFICATION"
    | "REJECTED"
    | "CORRECTION_REQUESTED"
    | "APPROVED";
};
export type AdminDriversControllerRequestCorrectionsApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DriverProfileDataDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerRequestCorrectionsApiArg = {
  profileId: string;
  suspendDriverDto: SuspendDriverDto;
};
export type AdminDriversControllerSuspendApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverProfileDataDto;
  timestamp: string;
  path: string;
};
export type AdminDriversControllerSuspendApiArg = {
  profileId: string;
  suspendDriverDto: SuspendDriverDto;
};
export type AdminDriversControllerReviewVehicleApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DriverProfileDataDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerReviewVehicleApiArg = {
  vehicleId: string;
  reviewVehicleDto: ReviewVehicleDto;
};
export type AdminDriversControllerReviewVehicleDocumentApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DocumentReviewedDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerReviewVehicleDocumentApiArg = {
  documentId: string;
  reviewDocumentDto: ReviewDocumentDto;
};
export type AdminDriversControllerCorrectDocumentApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DocumentReviewedDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerCorrectDocumentApiArg = {
  documentId: string;
  adminDocumentEditDto: AdminDocumentEditDto;
};
export type AdminDriversControllerCorrectVehicleDocumentApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DocumentReviewedDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerCorrectVehicleDocumentApiArg = {
  documentId: string;
  adminDocumentEditDto: AdminDocumentEditDto;
};
export type AdminDriversControllerListPendingApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminApplicationsPageDto;
  timestamp: string;
  path: string;
};
export type AdminDriversControllerListPendingApiArg = {
  limit?: number;
  offset?: number;
  search?: string;
  state?:
    | "DRAFT"
    | "PENDING_VERIFICATION"
    | "REJECTED"
    | "CORRECTION_REQUESTED"
    | "APPROVED";
};
export type AdminDriversControllerGetDriverDetailsApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: AdminDriverDetailDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerGetDriverDetailsApiArg = {
  profileId: string;
};
export type AdminDriversControllerReviewProfileApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DriverReviewedDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerReviewProfileApiArg = {
  profileId: string;
  reviewDriverDto: ReviewDriverDto;
};
export type AdminDriversControllerReviewDocumentApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: DocumentReviewedDto;
    timestamp: string;
    path: string;
  };
export type AdminDriversControllerReviewDocumentApiArg = {
  documentId: string;
  reviewDocumentDto: ReviewDocumentDto;
};
export type AdminReportingControllerSummaryApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminDashboardSummaryDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerSummaryApiArg = void;
export type AdminReportingControllerUsersApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminUsersPageDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerUsersApiArg = {
  limit?: number;
  offset?: number;
  search?: string;
  role?: "Driver" | "Passenger" | "Admin" | "UNSELECTED";
  accountStatus?: "ACTIVE" | "INACTIVE" | "BLOCKED";
};
export type AdminReportingControllerUserApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminUserDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerUserApiArg = {
  id: string;
};
export type AdminReportingControllerVehiclesApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminVehiclesPageDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerVehiclesApiArg = {
  limit?: number;
  offset?: number;
  search?: string;
  activity?: "active" | "inactive";
  category?: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
};
export type AdminReportingControllerVehicleApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminVehicleDetailDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerVehicleApiArg = {
  id: string;
};
export type AdminReportingControllerUpdateVehicleApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: AdminVehicleSavedDto;
    timestamp: string;
    path: string;
  };
export type AdminReportingControllerUpdateVehicleApiArg = {
  id: string;
  adminVehicleEditDto: AdminVehicleEditDto;
};
export type AdminReportingControllerPaymentApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminPaymentDetailDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerPaymentApiArg = {
  id: string;
};
export type AdminReportingControllerPaymentsApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminPaymentsPageDto;
  timestamp: string;
  path: string;
};
export type AdminReportingControllerPaymentsApiArg = {
  limit?: number;
  offset?: number;
  search?: string;
  status?:
    | "CREATED"
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED"
    | "CANCELLED";
  paymentType?: "ONLINE" | "OFFLINE";
  /** Inclusive creation timestamp */
  dateFrom?: string;
  /** Exclusive creation timestamp */
  dateTo?: string;
};
export type AdminReportingControllerApplicationsApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: AdminApplicationsPageDto;
    timestamp: string;
    path: string;
  };
export type AdminReportingControllerApplicationsApiArg = {
  limit?: number;
  offset?: number;
  search?: string;
  state?:
    | "DRAFT"
    | "PENDING_VERIFICATION"
    | "REJECTED"
    | "CORRECTION_REQUESTED"
    | "APPROVED";
};
export type AdminRidesControllerEligibleApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: EligibleDriversDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerEligibleApiArg = {
  id: string;
};
export type AdminRidesControllerRevokeApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverRideDetailDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerRevokeApiArg = {
  id: string;
  offerId: string;
  adminOfferReasonDto: AdminOfferReasonDto;
};
export type AdminRidesControllerCompleteApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverRideDetailDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerCompleteApiArg = {
  id: string;
  completeDriverRideDto: CompleteDriverRideDto;
};
export type AdminRidesControllerListApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: AdminRidesPageDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerListApiArg = {
  status?:
    | "PENDING_PAYMENT"
    | "PAYMENT_FAILED"
    | "PENDING_ASSIGNMENT"
    | "DRIVER_ASSIGNED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  limit?: number;
  offset?: number;
  userId?: string;
  driverProfileId?: string;
  view?: "assigned" | "completed";
  category?: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
};
export type AdminRidesControllerGetDetailApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: DriverRideDetailDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerGetDetailApiArg = {
  id: string;
};
export type AdminRidesControllerAssignApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideDetailDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerAssignApiArg = {
  id: string;
  assignRideDto: AssignRideDto;
};
export type AdminRidesControllerCancelApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideDetailDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerCancelApiArg = {
  id: string;
  cancelRideDto: CancelRideDto;
};
export type AdminRidesControllerUpdateStatusApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideDetailDto;
  timestamp: string;
  path: string;
};
export type AdminRidesControllerUpdateStatusApiArg = {
  id: string;
  updateRideStatusDto: UpdateRideStatusDto;
};
export type AdminRidesControllerMarkOfflinePaidApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: PaymentDataDto;
    timestamp: string;
    path: string;
  };
export type AdminRidesControllerMarkOfflinePaidApiArg = {
  id: string;
  paymentId: string;
};
export type AdminCabsControllerListApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: VehicleCategoryResponseDto[];
  timestamp: string;
  path: string;
};
export type AdminCabsControllerListApiArg = void;
export type AdminCabsControllerUpdateApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: VehicleCategoryResponseDto;
  timestamp: string;
  path: string;
};
export type AdminCabsControllerUpdateApiArg = {
  category: string;
  updateCabCategoryDto: UpdateCabCategoryDto;
};
export type MediaControllerUploadVehiclePhotoApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: ImageDataDto;
  timestamp: string;
  path: string;
};
export type MediaControllerUploadVehiclePhotoApiArg = {
  vehicleId: string;
  uploadVehiclePhotoDto: UploadVehiclePhotoDto;
};
export type MediaControllerUploadDocumentApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: DocumentUploadDataDto;
  timestamp: string;
  path: string;
};
export type MediaControllerUploadDocumentApiArg = {
  uploadDocumentDto: UploadDocumentDto;
};
export type MediaControllerViewDocumentApiResponse =
  /** status 200 Private document bytes */ Blob;
export type MediaControllerViewDocumentApiArg = {
  id: string;
  download?: "1";
};
export type MediaControllerGetUploadAuthApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: UploadAuthResponseDto;
  timestamp: string;
  path: string;
};
export type MediaControllerGetUploadAuthApiArg = void;
export type MediaControllerRegisterImageApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: ImageDataDto;
  timestamp: string;
  path: string;
};
export type MediaControllerRegisterImageApiArg = {
  registerImageDto: RegisterImageDto;
};
export type MediaControllerListImagesApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: ImagesDataDto;
  timestamp: string;
  path: string;
};
export type MediaControllerListImagesApiArg = {
  ownerId: string;
  ownerType: "USER" | "DRIVER_DOCUMENT" | "VEHICLE" | "VEHICLE_DOCUMENT";
};
export type MediaControllerDeleteImageApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: MessageResponseDto;
  timestamp: string;
  path: string;
};
export type MediaControllerDeleteImageApiArg = {
  id: string;
  expectedRevision?: number;
};
export type RidesControllerLocationsApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: LocationSuggestionDto[];
  timestamp: string;
  path: string;
};
export type RidesControllerLocationsApiArg = {
  text: string;
};
export type RidesControllerListVehicleCategoriesApiResponse =
  /** status 200  */ {
    success: true;
    message: string;
    data: VehicleCategoryResponseDto[];
    timestamp: string;
    path: string;
  };
export type RidesControllerListVehicleCategoriesApiArg = void;
export type RidesControllerEstimatesApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideEstimatesResponseDto;
  timestamp: string;
  path: string;
};
export type RidesControllerEstimatesApiArg = {
  rideEstimateDto: RideEstimateDto;
};
export type RidesControllerVerifyPaymentApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideDetailDto;
  timestamp: string;
  path: string;
};
export type RidesControllerVerifyPaymentApiArg = {
  id: string;
  verifyRidePaymentDto: VerifyRidePaymentDto;
};
export type RidesControllerQuoteApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideQuoteResponseDto;
  timestamp: string;
  path: string;
};
export type RidesControllerQuoteApiArg = {
  rideQuoteDto: RideQuoteDto;
};
export type RidesControllerCreateApiResponse = /** status 201  */ {
  success: true;
  message: string;
  data: RideDetailDto;
  timestamp: string;
  path: string;
};
export type RidesControllerCreateApiArg = {
  createRideDto: CreateRideDto;
};
export type RidesControllerListMineApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: PassengerRidesDataDto;
  timestamp: string;
  path: string;
};
export type RidesControllerListMineApiArg = {
  status?:
    | "PENDING_PAYMENT"
    | "PAYMENT_FAILED"
    | "PENDING_ASSIGNMENT"
    | "DRIVER_ASSIGNED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  limit?: number;
  offset?: number;
  /** Upcoming contains active rides. Completed contains completed and cancelled rides. */
  view?: "upcoming" | "completed";
};
export type RidesControllerGetMineApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: RideDetailDto;
  timestamp: string;
  path: string;
};
export type RidesControllerGetMineApiArg = {
  id: string;
};
export type RidesControllerPayOnlineApiResponse = /** status 200  */ {
  success: true;
  message: string;
  data: OnlinePaymentDto;
  timestamp: string;
  path: string;
};
export type RidesControllerPayOnlineApiArg = {
  id: string;
};
export type RazorpayWebhookControllerHandleApiResponse = unknown;
export type RazorpayWebhookControllerHandleApiArg = {
  "x-razorpay-signature": string;
  "x-razorpay-event-id": string;
};
export type LivenessDto = {
  status: "ok";
};
export type DatabaseHealthDto = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
};
export type PoolStatsDto = {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  max: number;
};
export type ReadinessDto = {
  status: "ready" | "not_ready";
  db: DatabaseHealthDto;
  pool: PoolStatsDto;
  ping: number;
  saturated: boolean;
  shuttingDown: boolean;
};
export type UserResponseDto = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  auth_provider: "apple" | "email" | "google" | "phone";
  global_role: ("Admin" | "Driver" | "Passenger") | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  is_blocked: boolean;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  timezone: string;
  language: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};
export type RegistrationResponseDto = {
  user: UserResponseDto;
  message: string;
  dev_otp?: string;
};
export type RegisterDto = {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number: string;
  password: string;
  role: "Passenger" | "Driver";
};
export type UserDataDto = {
  user: UserResponseDto;
};
export type VerifyOtpDto = {
  email: string;
  otp: string;
};
export type OtpMessageResponseDto = {
  message: string;
  dev_otp?: string;
};
export type ResendOtpDto = {
  email: string;
};
export type AuthSessionResponseDto = {
  user: UserResponseDto;
  access_token: string;
  access_token_expires_at: string;
  refresh_token?: string;
  refresh_token_expires_at?: string;
};
export type LoginDto = {
  email?: string;
  phone_number?: string;
  password: string;
};
export type RefreshSessionResponseDto = {
  message: string;
  access_token: string;
  access_token_expires_at: string;
};
export type MessageResponseDto = {
  message: string;
};
export type ForgotPasswordDto = {
  email: string;
};
export type ResetPasswordDto = {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
};
export type ChooseRoleDto = {
  role: "Passenger" | "Driver";
};
export type UpdateProfileDto = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  timezone?: string;
  language?: string;
};
export type ChangePasswordDto = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};
export type DriverProfileResponseDto = {
  id: string;
  user_id: string;
  status:
    "DRAFT" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED" | "SUSPENDED";
  created_at: string;
  updated_at: string;
};
export type OnboardingVerificationDto = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  reviewed_at: string | null;
  correction_document_ids: string[];
  submitted_at: string;
};
export type CorrectionBaselineDto = {
  document_number: string | null;
  expiry_date: string | null;
};
export type DocumentCorrectionDto = {
  mode: "IMAGE" | "METADATA" | "BOTH";
  fields: ("document_number" | "expiry_date")[];
  baseline: CorrectionBaselineDto;
  image_completed: boolean;
};
export type ImageResponseDto = {
  id: string;
  owner_type: "USER" | "DRIVER_DOCUMENT" | "VEHICLE" | "VEHICLE_DOCUMENT";
  owner_id: string;
  image_type: string;
  imagekit_file_id: string;
  url: string;
  file_name: string | null;
  mime_type: string | null;
  created_at: string;
  updated_at: string;
};
export type DocumentWithImagesDto = {
  revision: number;
  correction: DocumentCorrectionDto | null;
  expiry_date: string | null;
  id: string;
  driver_profile_id: string;
  document_type:
    "AADHAAR" | "DRIVING_LICENCE" | "OTHER" | "PAN" | "POLICE_VERIFICATION";
  document_number: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  images: ImageResponseDto[];
};
export type BankAccountResponseDto = {
  id: string;
  driver_profile_id: string;
  account_holder_name: string;
  account_number: string;
  ifsc: string;
  bank_name: string;
  razorpay_fund_account_id: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};
export type AdminVehicleDocumentDto = {
  revision: number;
  correction: DocumentCorrectionDto | null;
  id: string;
  document_type: string;
  document_number: string | null;
  expiry_date: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  images: ImageResponseDto[];
};
export type AdminVehicleDto = {
  details_review_status: "PENDING" | "APPROVED" | "REJECTED";
  photos_review_status: "PENDING" | "APPROVED" | "REJECTED";
  details_rejection_reason: string | null;
  photos_rejection_reason: string | null;
  photos_correction_completed: boolean;
  review_revision: number;
  id: string;
  driver_profile_id: string;
  vehicle_number: string;
  vehicle_type: ("SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12") | null;
  make: string | null;
  model: string | null;
  color: string | null;
  manufacturing_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: ImageResponseDto[];
  documents: AdminVehicleDocumentDto[];
};
export type OnboardingChecklistDto = {
  vehicle_photo: boolean;
  insurance: boolean;
  driving_licence: boolean;
  vehicle: boolean;
  rc: boolean;
  puc: boolean;
};
export type DriverOnboardingDataDto = {
  can_edit_vehicle_photos: boolean;
  can_edit_vehicle: boolean;
  can_submit: boolean;
  ride_eligible: boolean;
  ride_eligibility_reason: string | null;
  application_status:
    "DRAFT" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  profile: DriverProfileResponseDto;
  verification: OnboardingVerificationDto | null;
  documents: DocumentWithImagesDto[];
  bank_account: BankAccountResponseDto | null;
  vehicles: AdminVehicleDto[];
  checklist: OnboardingChecklistDto;
  complete: boolean;
};
export type DocumentResponseDto = {
  revision: number;
  correction: DocumentCorrectionDto | null;
  expiry_date: string | null;
  id: string;
  driver_profile_id: string;
  document_type:
    "AADHAAR" | "DRIVING_LICENCE" | "OTHER" | "PAN" | "POLICE_VERIFICATION";
  document_number: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
};
export type DocumentCreatedDto = {
  document: DocumentResponseDto;
  message: string;
};
export type CreateDriverDocumentDto = {
  expiry_date?: string;
  /** Required when updating an existing document */
  expected_revision?: number;
  document_type:
    "AADHAAR" | "DRIVING_LICENCE" | "POLICE_VERIFICATION" | "PAN" | "OTHER";
  document_number?: string;
};
export type VehicleResponseDto = {
  id: string;
  driver_profile_id: string;
  vehicle_number: string;
  vehicle_type: ("SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12") | null;
  make: string | null;
  model: string | null;
  color: string | null;
  manufacturing_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type VehicleDataDto = {
  vehicle: VehicleResponseDto;
};
export type CreateDriverVehicleDto = {
  expected_revision?: number;
  vehicle_number: string;
  vehicle_type: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  make?: string;
  model?: string;
  color?: string;
  manufacturing_year?: number;
};
export type VehicleDocumentResponseDto = {
  revision: number;
  correction: DocumentCorrectionDto | null;
  id: string;
  vehicle_id: string;
  document_type: string;
  document_number: string | null;
  expiry_date: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
};
export type VehicleDocumentCreatedDto = {
  document: VehicleDocumentResponseDto;
  message: string;
};
export type CreateVehicleDocumentDto = {
  /** Required when updating an existing document */
  expected_revision?: number;
  document_type: "RC" | "PUC" | "INSURANCE" | "PERMIT" | "OTHER";
  document_number?: string;
  expiry_date?: string;
};
export type DriverProfileDataDto = {
  profile: DriverProfileResponseDto;
};
export type DocumentsDataDto = {
  documents: DocumentWithImagesDto[];
};
export type BankAccountSavedDto = {
  bank_account: BankAccountResponseDto;
};
export type UpsertBankDetailsDto = {
  account_holder_name: string;
  account_number: string;
  ifsc: string;
  bank_name: string;
  razorpay_fund_account_id?: string;
};
export type BankAccountDataDto = {
  bank_account: BankAccountResponseDto | null;
};
export type VehicleWithImagesDto = {
  id: string;
  driver_profile_id: string;
  vehicle_number: string;
  vehicle_type: ("SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12") | null;
  make: string | null;
  model: string | null;
  color: string | null;
  manufacturing_year: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: ImageResponseDto[];
};
export type VehiclesDataDto = {
  vehicles: VehicleWithImagesDto[];
};
export type VerificationSubmittedDto = {
  id: string;
  driver_profile_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submitted_at: string;
};
export type DriverSubmittedDto = {
  profile: DriverProfileResponseDto;
  verification: VerificationSubmittedDto;
};
export type RideIdentityDto = {
  driver_name: string;
  vehicle_number: string;
  vehicle_category: string;
};
export type DriverOfferListItemDto = {
  identity: RideIdentityDto | null;
  id: string;
  ride_id: string;
  driver_profile_id: string;
  vehicle_id: string;
  assigned_by: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "REVOKED";
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  reason: string | null;
  released_at: string | null;
  released_by: string | null;
  release_reason: string | null;
  cancelled_at: string | null;
  ride_status: string;
  pickup_at: string;
  pickup_address: string;
  destination_address: string;
  can_view_ride: boolean;
};
export type DriverOffersDto = {
  offers: DriverOfferListItemDto[];
  total: number;
  limit: number;
  offset: number;
};
export type RideResponseDto = {
  bag_count: number;
  special_requests: string | null;
  id: string;
  booked_by_user_id: string;
  driver_profile_id: string | null;
  vehicle_id: string | null;
  requested_vehicle_category:
    "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  passenger_count: number;
  trip_type: "ONE_WAY" | "ROUND_TRIP";
  pickup_address: string;
  pickup_exact_location: string | null;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address: string;
  exact_destination: string | null;
  destination_latitude: number;
  destination_longitude: number;
  distance_km: number;
  estimated_duration_minutes: number;
  pickup_at: string;
  return_at: string | null;
  estimated_fare: number;
  final_fare: number | null;
  payment_option: "OFFLINE" | "ONLINE" | "PARTIAL";
  status:
    | "PENDING_PAYMENT"
    | "PAYMENT_FAILED"
    | "PENDING_ASSIGNMENT"
    | "DRIVER_ASSIGNED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  assigned_by: string | null;
  assigned_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};
export type RidePassengerResponseDto = {
  id: string;
  name: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
};
export type PaymentResponseDto = {
  id: string;
  ride_id: string;
  payment_type: "OFFLINE" | "ONLINE";
  amount: number;
  currency: string;
  provider: string | null;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  status:
    | "CANCELLED"
    | "CREATED"
    | "FAILED"
    | "PAID"
    | "PARTIALLY_REFUNDED"
    | "PENDING"
    | "REFUNDED";
  payment_method: string | null;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
};
export type PaymentSummaryDto = {
  estimated_fare: number;
  paid_amount: number;
  remaining_amount: number;
  summary_status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
};
export type StatusHistoryDto = {
  id: string;
  old_status:
    | (
        | "PENDING_PAYMENT"
        | "PAYMENT_FAILED"
        | "PENDING_ASSIGNMENT"
        | "DRIVER_ASSIGNED"
        | "CONFIRMED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
      )
    | null;
  new_status:
    | "PENDING_PAYMENT"
    | "PAYMENT_FAILED"
    | "PENDING_ASSIGNMENT"
    | "DRIVER_ASSIGNED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";
  changed_by: string | null;
  note: string | null;
  created_at: string;
};
export type RideOfferDto = {
  identity: RideIdentityDto | null;
  id: string;
  ride_id: string;
  driver_profile_id: string;
  vehicle_id: string;
  assigned_by: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "REVOKED";
  expires_at: string;
  created_at: string;
  responded_at: string | null;
  reason: string | null;
  released_at: string | null;
  released_by: string | null;
  release_reason: string | null;
  cancelled_at: string | null;
};
export type CompletionDeclarationDto = {
  id: string;
  ride_id: string;
  driver_profile_id: string;
  declared_by: string;
  declared_cash: number;
  payment_id: string | null;
  note: string | null;
  created_at: string;
};
export type DriverRideDetailDto = {
  ride: RideResponseDto;
  passengers: RidePassengerResponseDto[];
  payments: PaymentResponseDto[];
  payment_summary: PaymentSummaryDto;
  status_history: StatusHistoryDto[];
  vehicle: VehicleResponseDto | null;
  offers: RideOfferDto[];
  permitted_actions: string[];
  completion?: CompletionDeclarationDto;
};
export type OfferResultDto = {
  offer: RideOfferDto;
};
export type OfferReasonDto = {
  reason?: string;
};
export type CompleteDriverRideDto = {
  operation_id: string;
  expected_outstanding: number;
  declared_cash: number;
  note?: string;
};
export type AdminApplicationDto = {
  id: string;
  user_id: string;
  profile_status: string;
  full_name: string;
  application_status: string;
  review_state: string;
  email: string | null;
  has_corrections: boolean;
  created_at: string;
  submitted_at: string | null;
};
export type AdminApplicationsPageDto = {
  total: number;
  limit: number;
  offset: number;
  items: AdminApplicationDto[];
};
export type SuspendDriverDto = {
  operation_id: string;
  reason: string;
};
export type ReviewVehicleDto = {
  operation_id: string;
  reason?: string;
  decision: "APPROVED" | "REJECTED";
  rejection_reason?: string;
  group: "DETAILS" | "PHOTOS";
  expected_revision: number;
};
export type DocumentReviewResultDto = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  reviewed_at: string | null;
  revision: number;
  correction: DocumentCorrectionDto | null;
};
export type DocumentReviewedDto = {
  document: DocumentReviewResultDto | null;
};
export type ReviewDocumentDto = {
  operation_id: string;
  reason?: string;
  expected_revision: number;
  correction_mode?: "IMAGE" | "METADATA" | "BOTH";
  metadata_fields?: ("document_number" | "expiry_date")[];
  decision: "APPROVED" | "REJECTED";
  rejection_reason?: string;
};
export type AdminDocumentEditDto = {
  operation_id: string;
  reason: string;
  expected_revision: number;
  document_number?: string | null;
  expiry_date?: string | null;
};
export type DocumentAuditValuesDto = {
  document_number: string | null;
  expiry_date: string | null;
};
export type DriverReviewAuditDetailsDto = {
  before?: DocumentAuditValuesDto;
  after?: DocumentAuditValuesDto;
  previous_revision?: number;
  revision?: number;
  mode?: string;
  fields?: string[];
  baseline?: DocumentAuditValuesDto;
  image_completed?: boolean;
};
export type DriverReviewAuditDto = {
  details: DriverReviewAuditDetailsDto | null;
  id: string;
  document_kind: string;
  document_id: string | null;
  decision: string;
  reason: string | null;
  reviewed_by: string;
  created_at: string;
};
export type AdminDocumentDto = {
  revision: number;
  correction: DocumentCorrectionDto | null;
  expiry_date: string | null;
  id: string;
  document_type:
    "AADHAAR" | "DRIVING_LICENCE" | "OTHER" | "PAN" | "POLICE_VERIFICATION";
  document_number: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  uploaded_at: string;
  reviewed_at: string | null;
  images: ImageResponseDto[];
};
export type AdminBankAccountDto = {
  id: string;
  account_holder_name: string;
  account_number: string;
  ifsc: string;
  bank_name: string;
  razorpay_fund_account_id: string | null;
  is_verified: boolean;
};
export type AdminDriverDetailDto = {
  compliance_approved: boolean;
  ride_eligible: boolean;
  application_status:
    "DRAFT" | "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";
  audit: DriverReviewAuditDto[];
  profile: DriverProfileResponseDto;
  user: UserResponseDto | null;
  documents: AdminDocumentDto[];
  bank_account: AdminBankAccountDto | null;
  vehicles: AdminVehicleDto[];
};
export type ReviewResultDto = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejection_reason: string | null;
  reviewed_at: string | null;
};
export type DriverReviewedDto = {
  profile: DriverProfileResponseDto | null;
  verification: ReviewResultDto | null;
};
export type ReviewDriverDto = {
  operation_id: string;
  reason?: string;
  decision: "APPROVED" | "REJECTED";
  rejection_reason?: string;
};
export type AdminRolePercentagesDto = {
  drivers: number;
  passengers: number;
  admins: number;
  unselected: number;
};
export type AdminUserCountsDto = {
  total: number;
  drivers: number;
  passengers: number;
  admins: number;
  unselected: number;
  percentages: AdminRolePercentagesDto;
};
export type AdminVehicleCountsDto = {
  total: number;
  active: number;
};
export type AdminRideCountsDto = {
  total: number;
  today: number;
  active: number;
  completed: number;
  awaiting_assignment: number;
  awaiting_acceptance: number;
  confirmed: number;
  ongoing: number;
  cancelled: number;
  pending_payment: number;
  payment_failed: number;
};
export type AdminVerificationCountsDto = {
  pending_drivers: number;
  pending_documents: number;
};
export type AdminDashboardSummaryDto = {
  users: AdminUserCountsDto;
  vehicles: AdminVehicleCountsDto;
  rides: AdminRideCountsDto;
  verifications: AdminVerificationCountsDto;
  calculated_at: string;
  pending_reviews: AdminApplicationDto[];
  recent_verifications: AdminApplicationDto[];
  recent_bookings: RideResponseDto[];
  awaiting_rides: RideResponseDto[];
};
export type AdminUserDto = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  global_role: string | null;
  is_active: boolean;
  is_blocked: boolean;
  created_at: string;
  last_login_at: string | null;
};
export type AdminUsersPageDto = {
  total: number;
  limit: number;
  offset: number;
  items: AdminUserDto[];
};
export type AdminVehicleDocumentSummaryDto = {
  id: string;
  vehicle_id: string;
  document_type: string;
  status: string;
  expiry_date: string | null;
};
export type AdminFleetVehicleDto = {
  id: string;
  driver_profile_id: string;
  vehicle_number: string;
  driver_name: string;
  vehicle_type: string | null;
  make: string | null;
  model: string | null;
  is_active: boolean;
  color: string | null;
  manufacturing_year: number | null;
  updated_at: string;
  created_at: string;
  documents: AdminVehicleDocumentSummaryDto[];
};
export type AdminVehiclesPageDto = {
  total: number;
  limit: number;
  offset: number;
  items: AdminFleetVehicleDto[];
};
export type AdminVehicleBlockingDto = {
  ride_id: string;
  offer_id: string | null;
};
export type AdminVehicleAuditValuesDto = {
  vehicleNumber: string;
  vehicleType: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  manufacturingYear: number | null;
  active: boolean;
};
export type AdminVehicleAuditDto = {
  id: string;
  actor_id: string;
  reason: string | null;
  before_values: AdminVehicleAuditValuesDto;
  after_values: AdminVehicleAuditValuesDto;
  created_at: string;
};
export type AdminVehicleDetailDto = {
  vehicle: AdminVehicleDto;
  driver: AdminUserDto | null;
  blocking: AdminVehicleBlockingDto[];
  audit: AdminVehicleAuditDto[];
};
export type AdminVehicleSavedDto = {
  vehicle: VehicleResponseDto;
};
export type AdminVehicleEditDto = {
  expected_revision?: number;
  vehicle_number: string;
  vehicle_type: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  make?: string;
  model?: string;
  color?: string;
  manufacturing_year?: number;
  operation_id: string;
  expected_updated_at: string;
  is_active: boolean;
  reason?: string;
};
export type AdminPaymentTransactionDto = {
  id: string;
  ride_id: string;
  user_id: string;
  user_name: string;
  payment_type: string;
  currency: string;
  status: string;
  amount: number;
  provider: string | null;
  payment_method: string | null;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
};
export type AdminPaymentDetailDto = {
  payment: AdminPaymentTransactionDto;
  payment_summary: PaymentSummaryDto;
};
export type AdminPaymentDto = {
  id: string;
  ride_id: string;
  user_id: string;
  user_name: string;
  payment_type: string;
  currency: string;
  status: string;
  amount: number;
  provider: string | null;
  payment_method: string | null;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
};
export type AdminPaymentSummaryDto = {
  total: number;
  online_collected: number;
  cash_collected: number;
  successful: number;
  failed: number;
  refunded: number;
  partially_refunded: number;
};
export type AdminPaymentsPageDto = {
  total: number;
  limit: number;
  offset: number;
  items: AdminPaymentDto[];
  summary: AdminPaymentSummaryDto;
};
export type EligibleDriverDto = {
  driver_profile_id: string;
  vehicle_id: string;
  vehicle_number: string;
  vehicle_type: string;
  full_name: string;
};
export type EligibleDriversDto = {
  drivers: EligibleDriverDto[];
};
export type AdminOfferReasonDto = {
  reason?: string;
  operation_id: string;
};
export type AdminRidesPageDto = {
  total: number;
  limit: number;
  offset: number;
  items: RideResponseDto[];
  rides: RideResponseDto[];
};
export type RideDetailDto = {
  ride: RideResponseDto;
  passengers: RidePassengerResponseDto[];
  payments: PaymentResponseDto[];
  payment_summary: PaymentSummaryDto;
  status_history: StatusHistoryDto[];
};
export type AssignRideDto = {
  operation_id: string;
  reason: string;
  driver_profile_id: string;
  vehicle_id: string;
};
export type CancelRideDto = {
  operation_id: string;
  reason?: string;
  refund_required?: boolean;
};
export type UpdateRideStatusDto = {
  reason?: string;
  status: "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
};
export type PaymentDataDto = {
  payment: PaymentResponseDto | null;
};
export type VehicleCategoryResponseDto = {
  description: string;
  image_url: string | null;
  bag_capacity: number;
  is_active: boolean;
  category: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  display_name: string;
  base_fare_inr: number;
  per_km_rate_inr: number;
  min_fare_inr: number;
  seat_limit: number;
};
export type UpdateCabCategoryDto = {
  display_name: string;
  description: string;
  image_url?: string | null;
  bag_capacity: number;
  base_fare_inr: number;
  per_km_rate_inr: number;
  min_fare_inr: number;
  is_active: boolean;
};
export type ImageDataDto = {
  image: ImageResponseDto;
};
export type UploadVehiclePhotoDto = {
  expected_revision?: number;
  /** Base64 encoded JPEG, PNG, or WebP, maximum 10 MB decoded */
  content_base64: string;
};
export type DocumentUploadDataDto = {
  image: ImageResponseDto;
  document_revision: number;
};
export type UploadDocumentDto = {
  expected_revision: number;
  owner_type: "DRIVER_DOCUMENT" | "VEHICLE_DOCUMENT";
  owner_id: string;
  /** Base64 encoded JPEG, PNG, or WebP, maximum 10 MB decoded */
  content_base64: string;
  /** Must be MASKED for Aadhaar uploads */
  aadhaar_copy?: string;
};
export type UploadAuthResponseDto = {
  public_key: string;
  token: string;
  expire: number;
  signature: string;
};
export type RegisterImageDto = {
  owner_type: "USER" | "DRIVER_DOCUMENT" | "VEHICLE" | "VEHICLE_DOCUMENT";
  owner_id: string;
  image_type: string;
  imagekit_file_id: string;
  url: string;
  file_name?: string;
  mime_type?: string;
};
export type ImagesDataDto = {
  images: ImageResponseDto[];
};
export type LocationSuggestionDto = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};
export type FareBreakdownDto = {
  base_fare_inr: number;
  per_km_rate_inr: number;
  distance_km: number;
  distance_charge_inr: number;
  estimated_fare_inr: number;
};
export type CabEstimateDto = {
  description: string;
  image_url: string | null;
  bag_capacity: number;
  is_active: boolean;
  category: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  display_name: string;
  base_fare_inr: number;
  per_km_rate_inr: number;
  min_fare_inr: number;
  seat_limit: number;
  fare_breakdown: FareBreakdownDto;
};
export type RideEstimatesResponseDto = {
  distance_km: number;
  estimated_duration_minutes: number;
  route_geometry?: string;
  online_payment_available: boolean;
  partial_advance_percent: number;
  categories: CabEstimateDto[];
};
export type RideEstimateDto = {
  pickup_address: string;
  pickup_exact_location?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address: string;
  exact_destination?: string;
  destination_latitude: number;
  destination_longitude: number;
  trip_type: "ONE_WAY" | "ROUND_TRIP";
  pickup_at: string;
  return_at?: string;
};
export type VerifyRidePaymentDto = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
export type RideQuoteResponseDto = {
  /** ORS encoded polyline, precision 5. Outbound route for round trips. */
  route_geometry?: string;
  vehicle_category: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  seat_limit: number;
  passenger_count: number;
  trip_type: "ONE_WAY" | "ROUND_TRIP";
  distance_km: number;
  estimated_duration_minutes: number;
  fare_breakdown: FareBreakdownDto;
};
export type RidePassengerDto = {
  name: string;
  phone: string;
  is_primary?: boolean;
};
export type RideQuoteDto = {
  pickup_address: string;
  pickup_exact_location?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address: string;
  exact_destination?: string;
  destination_latitude: number;
  destination_longitude: number;
  trip_type: "ONE_WAY" | "ROUND_TRIP";
  pickup_at: string;
  return_at?: string;
  vehicle_category: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  bag_count?: number;
  special_requests?: string;
  passengers: RidePassengerDto[];
};
export type CreateRideDto = {
  pickup_address: string;
  pickup_exact_location?: string;
  pickup_latitude: number;
  pickup_longitude: number;
  destination_address: string;
  exact_destination?: string;
  destination_latitude: number;
  destination_longitude: number;
  trip_type: "ONE_WAY" | "ROUND_TRIP";
  pickup_at: string;
  return_at?: string;
  vehicle_category: "SEATER_4" | "SEATER_5" | "SEATER_7" | "SEATER_12";
  bag_count?: number;
  special_requests?: string;
  passengers: RidePassengerDto[];
  booking_key?: string;
  /** Fare last approved by the passenger */
  accepted_fare_inr?: number;
  payment_option: "ONLINE" | "OFFLINE" | "PARTIAL";
};
export type PassengerRideCountsDto = {
  upcoming: number;
  completed: number;
};
export type PassengerRidesDataDto = {
  rides: RideResponseDto[];
  total: number;
  limit: number;
  offset: number;
  counts: PassengerRideCountsDto;
};
export type RazorpayOrderDto = {
  key_id: string;
  order_id: string;
  amount: number | string;
  currency: string;
};
export type OnlinePaymentDto = {
  ride_id: string;
  payment: PaymentResponseDto | null;
  razorpay: RazorpayOrderDto;
};
export const {
  useHealthControllerLivenessQuery,
  useLazyHealthControllerLivenessQuery,
  useHealthControllerReadinessQuery,
  useLazyHealthControllerReadinessQuery,
  useAuthControllerRegisterMutation,
  useAuthControllerVerifyOtpMutation,
  useAuthControllerResendOtpMutation,
  useAuthControllerLoginMutation,
  useAuthControllerRefreshMutation,
  useAuthControllerLogoutMutation,
  useAuthControllerForgotPasswordMutation,
  useAuthControllerResetPasswordMutation,
  useAuthControllerChooseRoleMutation,
  useAuthControllerGetProfileQuery,
  useLazyAuthControllerGetProfileQuery,
  useAuthControllerUpdateProfileMutation,
  useAuthControllerChangePasswordMutation,
  useDriversControllerGetOnboardingQuery,
  useLazyDriversControllerGetOnboardingQuery,
  useDriversControllerUpdateDocumentMutation,
  useDriversControllerUpdateVehicleMutation,
  useDriversControllerUpdateVehicleDocumentMutation,
  useDriversControllerGetProfileQuery,
  useLazyDriversControllerGetProfileQuery,
  useDriversControllerAddDocumentMutation,
  useDriversControllerListDocumentsQuery,
  useLazyDriversControllerListDocumentsQuery,
  useDriversControllerUpsertBankDetailsMutation,
  useDriversControllerGetBankDetailsQuery,
  useLazyDriversControllerGetBankDetailsQuery,
  useDriversControllerAddVehicleMutation,
  useDriversControllerListVehiclesQuery,
  useLazyDriversControllerListVehiclesQuery,
  useDriversControllerAddVehicleDocumentMutation,
  useDriversControllerSubmitMutation,
  useDriverRidesControllerListQuery,
  useLazyDriverRidesControllerListQuery,
  useDriverRidesControllerDetailQuery,
  useLazyDriverRidesControllerDetailQuery,
  useDriverRidesControllerAcceptMutation,
  useDriverRidesControllerRejectMutation,
  useDriverRidesControllerStartMutation,
  useDriverRidesControllerCompleteMutation,
  useAdminDriversControllerListDriversQuery,
  useLazyAdminDriversControllerListDriversQuery,
  useAdminDriversControllerRequestCorrectionsMutation,
  useAdminDriversControllerSuspendMutation,
  useAdminDriversControllerReviewVehicleMutation,
  useAdminDriversControllerReviewVehicleDocumentMutation,
  useAdminDriversControllerCorrectDocumentMutation,
  useAdminDriversControllerCorrectVehicleDocumentMutation,
  useAdminDriversControllerListPendingQuery,
  useLazyAdminDriversControllerListPendingQuery,
  useAdminDriversControllerGetDriverDetailsQuery,
  useLazyAdminDriversControllerGetDriverDetailsQuery,
  useAdminDriversControllerReviewProfileMutation,
  useAdminDriversControllerReviewDocumentMutation,
  useAdminReportingControllerSummaryQuery,
  useLazyAdminReportingControllerSummaryQuery,
  useAdminReportingControllerUsersQuery,
  useLazyAdminReportingControllerUsersQuery,
  useAdminReportingControllerUserQuery,
  useLazyAdminReportingControllerUserQuery,
  useAdminReportingControllerVehiclesQuery,
  useLazyAdminReportingControllerVehiclesQuery,
  useAdminReportingControllerVehicleQuery,
  useLazyAdminReportingControllerVehicleQuery,
  useAdminReportingControllerUpdateVehicleMutation,
  useAdminReportingControllerPaymentQuery,
  useLazyAdminReportingControllerPaymentQuery,
  useAdminReportingControllerPaymentsQuery,
  useLazyAdminReportingControllerPaymentsQuery,
  useAdminReportingControllerApplicationsQuery,
  useLazyAdminReportingControllerApplicationsQuery,
  useAdminRidesControllerEligibleQuery,
  useLazyAdminRidesControllerEligibleQuery,
  useAdminRidesControllerRevokeMutation,
  useAdminRidesControllerCompleteMutation,
  useAdminRidesControllerListQuery,
  useLazyAdminRidesControllerListQuery,
  useAdminRidesControllerGetDetailQuery,
  useLazyAdminRidesControllerGetDetailQuery,
  useAdminRidesControllerAssignMutation,
  useAdminRidesControllerCancelMutation,
  useAdminRidesControllerUpdateStatusMutation,
  useAdminRidesControllerMarkOfflinePaidMutation,
  useAdminCabsControllerListQuery,
  useLazyAdminCabsControllerListQuery,
  useAdminCabsControllerUpdateMutation,
  useMediaControllerUploadVehiclePhotoMutation,
  useMediaControllerUploadDocumentMutation,
  useMediaControllerViewDocumentQuery,
  useLazyMediaControllerViewDocumentQuery,
  useMediaControllerGetUploadAuthQuery,
  useLazyMediaControllerGetUploadAuthQuery,
  useMediaControllerRegisterImageMutation,
  useMediaControllerListImagesQuery,
  useLazyMediaControllerListImagesQuery,
  useMediaControllerDeleteImageMutation,
  useRidesControllerLocationsQuery,
  useLazyRidesControllerLocationsQuery,
  useRidesControllerListVehicleCategoriesQuery,
  useLazyRidesControllerListVehicleCategoriesQuery,
  useRidesControllerEstimatesMutation,
  useRidesControllerVerifyPaymentMutation,
  useRidesControllerQuoteMutation,
  useRidesControllerCreateMutation,
  useRidesControllerListMineQuery,
  useLazyRidesControllerListMineQuery,
  useRidesControllerGetMineQuery,
  useLazyRidesControllerGetMineQuery,
  useRidesControllerPayOnlineMutation,
  useRazorpayWebhookControllerHandleMutation,
} = injectedRtkApi;

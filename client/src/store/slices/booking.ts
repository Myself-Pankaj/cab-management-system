import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  CreateRideDto,
  RideEstimateDto,
  RidePassengerDto,
} from "../api/generated/api";
import { sessionEnded } from "./session";

export type BookingDetails = {
  passengers: RidePassengerDto[];
  bag_count: number;
  special_requests: string;
  pickup_exact_location: string;
  exact_destination: string;
  payment_option: CreateRideDto["payment_option"];
};
type BookingState = {
  journey: RideEstimateDto | null;
  category: CreateRideDto["vehicle_category"] | null;
  details: BookingDetails;
  key: string | null;
};
const initialState: BookingState = {
  journey: null,
  category: null,
  key: null,
  details: {
    passengers: [],
    bag_count: 0,
    special_requests: "",
    pickup_exact_location: "",
    exact_destination: "",
    payment_option: "OFFLINE",
  },
};
const slice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    journeySelected(state, action: PayloadAction<RideEstimateDto>) {
      state.journey = action.payload;
      state.category = null;
      state.key = null;
    },
    categorySelected(
      state,
      action: PayloadAction<NonNullable<BookingState["category"]>>,
    ) {
      state.category = action.payload;
      state.key = null;
    },
    bookingDetailsChanged(
      state,
      action: PayloadAction<Partial<BookingDetails>>,
    ) {
      Object.assign(state.details, action.payload);
      state.key = null;
    },
    bookingKeyAssigned(state, action: PayloadAction<string>) {
      state.key = action.payload;
    },
    bookingCleared: () => initialState,
  },
  extraReducers(builder) {
    builder.addCase(sessionEnded, () => initialState);
  },
});
export const {
  journeySelected,
  categorySelected,
  bookingDetailsChanged,
  bookingKeyAssigned,
  bookingCleared,
} = slice.actions;
export const bookingReducer = slice.reducer;

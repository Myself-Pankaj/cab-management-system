"use client";
import { useSyncExternalStore } from "react";
import { useAppSelector } from "@/store/hooks";
import { useProfileQuery } from "@/store/api/enhanced-api";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useSession() {
  // A delayed route can hydrate after the header has already loaded the profile.
  // Keep its first client render consistent with the anonymous server snapshot.
  const hydrated = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const session = useAppSelector((state) => state.session);
  const profile = useProfileQuery(undefined, {
    skip: session.status === "anonymous",
    refetchOnMountOrArgChange: 60,
    refetchOnFocus: true,
  });
  return {
    ...session,
    status: hydrated ? session.status : ("unknown" as const),
    user:
      hydrated && session.status === "authenticated"
        ? profile.data?.data.user
        : undefined,
    isChecking:
      !hydrated ||
      (session.status === "unknown" &&
        (profile.isLoading || profile.isUninitialized)),
    error: hydrated ? profile.error : undefined,
    isFetching: profile.isFetching,
    retry: profile.refetch,
  };
}

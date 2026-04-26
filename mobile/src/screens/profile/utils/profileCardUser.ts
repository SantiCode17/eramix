import type { User } from "@/types";

const FALLBACK_BIRTHDATE = "2000-01-01";

export function toProfileCardUser(profile?: User | null): User {
  const firstName = profile?.firstName?.trim() || "Tu";
  const lastName = profile?.lastName?.trim() || "Perfil";

  return {
    id: profile?.id ?? 0,
    email: profile?.email ?? "perfil@eramix.app",
    firstName,
    lastName,
    dateOfBirth: profile?.dateOfBirth ?? FALLBACK_BIRTHDATE,
    profilePhotoUrl: profile?.profilePhotoUrl,
    bio: profile?.bio,
    homeUniversity: profile?.homeUniversity,
    hostUniversity: profile?.hostUniversity,
    destinationCity: profile?.destinationCity,
    destinationCountry: profile?.destinationCountry,
    mobilityStartDate: profile?.mobilityStartDate,
    mobilityEndDate: profile?.mobilityEndDate,
    latitude: profile?.latitude,
    longitude: profile?.longitude,
    locationUpdatedAt: profile?.locationUpdatedAt,
    isActive: profile?.isActive,
    isVerified: profile?.isVerified,
    lastSeen: profile?.lastSeen,
    createdAt: profile?.createdAt,
    interests: profile?.interests,
    languages: profile?.languages,
    photos: profile?.photos,
    friendCount: profile?.friendCount,
    eventCount: profile?.eventCount,
    whyAmIHere: profile?.whyAmIHere,
    favoriteSong: profile?.favoriteSong,
    favoriteFood: profile?.favoriteFood,
    specialHobby: profile?.specialHobby,
    customPrompts: profile?.customPrompts,
    socialInstagram: profile?.socialInstagram,
    socialTiktok: profile?.socialTiktok,
  };
}

// ── City Guide types ────────────────────────────────

export type PlaceCategory =
  | "RESTAURANT"
  | "BAR"
  | "CAFE"
  | "MUSEUM"
  | "PARK"
  | "NIGHTCLUB"
  | "LIBRARY"
  | "GYM"
  | "SUPERMARKET"
  | "TRANSPORT"
  | "UNIVERSITY"
  | "HOSPITAL"
  | "OTHER";

export interface Place {
  id: number;
  name: string;
  description?: string;
  category: PlaceCategory;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  userId: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface PlaceReview {
  id: number;
  placeId: number;
  userId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export type CityGuideStackParamList = {
  CityGuideList: undefined;
  PlaceDetail: { placeId: number };
};

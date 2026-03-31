import { apiClient } from "./client";
import type { Place, PlaceReview, PlaceCategory } from "@/types/cityGuide";

export const getPlaces = (city?: string, category?: PlaceCategory) => {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  if (category) params.append("category", category);
  const qs = params.toString();
  return apiClient.get<Place[]>(`/city-guide/places${qs ? `?${qs}` : ""}`);
};

export const getPlace = (id: number) =>
  apiClient.get<Place>(`/city-guide/places/${id}`);

export const createPlace = (data: {
  name: string;
  description?: string;
  category: PlaceCategory;
  address?: string;
  city: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}) => apiClient.post<Place>("/city-guide/places", data);

export const getReviews = (placeId: number) =>
  apiClient.get<PlaceReview[]>(`/city-guide/places/${placeId}/reviews`);

export const addReview = (placeId: number, data: { rating: number; comment?: string }) =>
  apiClient.post<PlaceReview>(`/city-guide/places/${placeId}/reviews`, data);

import { apiClient } from "./client";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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

export interface CityGuidePlace {
  id: number;
  name: string;
  description?: string;
  category: PlaceCategory;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  userId: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
}

export interface GetPlacesParams {
  city?: string;
  category?: PlaceCategory;
}

export interface CreatePlaceRequest {
  name: string;
  description?: string;
  category: PlaceCategory;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
}

async function getPlaces(params?: GetPlacesParams): Promise<CityGuidePlace[]> {
  const { data } = await apiClient.get<ApiResponse<CityGuidePlace[]>>(
    "/v1/city-guide/places",
    { params },
  );
  return data.data;
}

async function createPlace(request: CreatePlaceRequest): Promise<CityGuidePlace> {
  const { data } = await apiClient.post<ApiResponse<CityGuidePlace>>(
    "/v1/city-guide/places",
    request,
  );
  return data.data;
}

export const cityGuideApi = {
  getPlaces,
  createPlace,
};

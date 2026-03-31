export interface HousingPost {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userProfilePhotoUrl: string | null;
  title: string;
  description: string;
  city: string;
  address: string | null;
  monthlyRent: number;
  currency: string;
  availableFrom: string;
  availableUntil: string | null;
  roomsAvailable: number;
  postType: "OFFER" | "SEARCH";
  photoUrl: string | null;
  active: boolean;
  createdAt: string;
}

export type HousingStackParamList = {
  HousingList: undefined;
  HousingDetail: { postId: number };
};

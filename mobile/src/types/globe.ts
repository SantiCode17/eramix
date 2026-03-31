// ── Globe types matching backend DTOs ───────────────

export interface UniversityInfo {
  id: number;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  studentCount: number;
}

export interface CountryStats {
  country: string;
  studentCount: number;
  latitude: number;
  longitude: number;
  universities: UniversityInfo[];
}

// ── Country pin data for 3D rendering ───────────────

export interface CountryPin {
  country: string;
  latitude: number;
  longitude: number;
  studentCount: number;
  universities: UniversityInfo[];
  // 3D position (computed from lat/lng)
  position?: { x: number; y: number; z: number };
}

// ── Globe navigation param list ─────────────────────

export type GlobeStackParamList = {
  GlobeMain: undefined;
  CountryStudents: { country: string };
};

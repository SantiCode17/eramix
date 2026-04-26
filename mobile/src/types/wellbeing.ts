/**
 * ────────────────────────────────────────────────────────
 *  wellbeing.ts — Types para bienestar y SOS
 * ────────────────────────────────────────────────────────
 */

export interface WellbeingCheckin {
  id: number;
  moodScore: number;
  createdAt: string;
}

export interface EmergencyResource {
  id: number;
  countryCode: string;
  organizationName: string;
  emergencyNumber: string;
  mentalHealthLine: string;
  infoUrl: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phoneNumber: string;
  relationship: string;
}

export interface DailyMood {
  date: string;
  avgMood: number;
}

export interface WellbeingSummary {
  avgMood7d: number;
  avgMood30d: number;
  totalCheckins: number;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  dailyMoods: DailyMood[];
  resources: EmergencyResource[];
}

export interface SOSActivation {
  id: number;
  activationType: string;
  contactsNotified: number;
  countryCode: string;
  createdAt: string;
}

export type WellbeingStackParamList = {
  WellbeingHome: undefined;
  MoodHistory: undefined;
  SOSScreen: undefined;
  EmergencyContacts: undefined;
};

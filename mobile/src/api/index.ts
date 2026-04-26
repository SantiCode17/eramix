export { apiClient, TOKEN_KEYS, setOnSessionExpired, checkBackendHealth } from "./client";
export { authApi } from "./authService";
export { profileApi, catalogApi, friendsApi, accountApi } from "./profileService";
export { searchApi, friendRequestsApi } from "./discoverService";
export { financeApi } from "./financeService";
export { ticketingApi } from "./ticketingService";
export { wellbeingApi } from "./wellbeingService";
export { privacyApi } from "./privacyService";
export { ocrApi } from "./ocrService";
export { agentApi } from "./agentService";

// Direct function exports for services without namespace
export * as chatApi from "./chat";
export * as eventsApi from "./events";
export * as communitiesApi from "./communities";
export * as groupsApi from "./groups";
export * as notificationsApi from "./notifications";
export * as housingApi from "./housing";
export * as exchangeApi from "./exchange";
export * as globeApi from "./globe";
export * as storiesApi from "./stories";
export * as searchServiceApi from "./search";
export * as aiAssistantApi from "./aiAssistant";
export * as locationApi from "./locationService";

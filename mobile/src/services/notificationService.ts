/**
 * ────────────────────────────────────────────────────────
 *  notificationService.ts — Servicio de notificaciones
 * ────────────────────────────────────────────────────────
 */

import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Expo Go SDK 53+ no soporta notificaciones remotas — solo configurar en builds nativos
const isExpoGo = Constants.executionEnvironment === "storeClient";

// Configure notification handler (solo en builds nativos)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export interface NotificationConfig {
  enableNotifications: boolean;
  enableBudgetAlerts: boolean;
  alertThreshold: "75" | "90" | "100";
}

const DEFAULT_CONFIG: NotificationConfig = {
  enableNotifications: true,
  enableBudgetAlerts: true,
  alertThreshold: "75",
};

/**
 * Initialize notifications (request permissions on iOS, skip in Expo Go)
 */
export async function initializeNotifications(): Promise<void> {
  if (isExpoGo) {
    console.log("[Notifications] Expo Go detected — remote notifications skipped");
    return;
  }
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted");
    }
  } catch (error) {
    console.error("[Notifications] Initialization failed:", error);
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationConfig(): Promise<NotificationConfig> {
  try {
    const stored = await AsyncStorage.getItem("notificationConfig");
    return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
  } catch (error) {
    console.error("[Notifications] Failed to get config:", error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Save notification preferences
 */
export async function saveNotificationConfig(
  config: NotificationConfig,
): Promise<void> {
  try {
    await AsyncStorage.setItem("notificationConfig", JSON.stringify(config));
  } catch (error) {
    console.error("[Notifications] Failed to save config:", error);
  }
}

/**
 * Send budget alert notification
 */
export async function sendBudgetAlertNotification(
  categoryName: string,
  progressPercentage: number,
  alertLevel: "WARNING" | "CRITICAL",
): Promise<void> {
  try {
    const config = await getNotificationConfig();

    if (!config.enableNotifications || !config.enableBudgetAlerts) {
      return;
    }

    const title =
      alertLevel === "CRITICAL"
        ? "⚠️ Presupuesto excedido"
        : "⚡ Acercándose al límite";

    const body =
      alertLevel === "CRITICAL"
        ? `Has excedido el presupuesto de ${categoryName} (${progressPercentage.toFixed(0)}%)`
        : `Llevas ${progressPercentage.toFixed(0)}% del presupuesto en ${categoryName}`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        badge: 1,
        sound: true,
        data: {
          categoryName,
          progressPercentage,
          alertLevel,
          screen: "BudgetAlerts",
        },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("[Notifications] Failed to send alert:", error);
  }
}

/**
 * Send general transaction notification
 */
export async function sendTransactionNotification(
  categoryName: string,
  amount: number,
  type: "INCOME" | "EXPENSE",
): Promise<void> {
  try {
    const config = await getNotificationConfig();

    if (!config.enableNotifications) {
      return;
    }

    const title = type === "INCOME" ? "💰 Ingreso registrado" : "📤 Gasto registrado";
    const symbol = type === "INCOME" ? "+" : "-";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: `${symbol}€${amount.toFixed(2)} en ${categoryName}`,
        badge: 1,
        sound: true,
        data: {
          categoryName,
          amount,
          type,
          screen: "TransactionHistory",
        },
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("[Notifications] Failed to send transaction notification:", error);
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export function setupNotificationResponseListener(
  onResponse: (data: any) => void,
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data;
      onResponse(data);
    },
  );

  return () => subscription.remove();
}

/**
 * Get presented notifications
 */
export async function getPresentedNotifications(): Promise<
  Notifications.Notification[]
> {
  return await Notifications.getPresentedNotificationsAsync();
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

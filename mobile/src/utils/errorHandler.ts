/**
 * ────────────────────────────────────────────────────────
 *  errorHandler.ts — Utilidad centralizada de errores
 * ────────────────────────────────────────────────────────
 *
 *  Clasifica CUALQUIER error (Axios, JS nativo, desconocido)
 *  y devuelve un objeto tipado con:
 *    • message  → texto amigable para el usuario
 *    • code     → código interno para debugging
 *    • status   → HTTP status (si aplica)
 *    • details  → info técnica para logs
 */

import { AxiosError } from "axios";
import { Platform } from "react-native";

// ── Tipos ───────────────────────────────────────────

export type ErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "SERVER_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "SESSION_EXPIRED"
  | "UNKNOWN";

export interface ParsedError {
  /** Mensaje amigable para mostrar al usuario */
  message: string;
  /** Código interno de error */
  code: ErrorCode;
  /** HTTP status code (si aplica) */
  status?: number;
  /** Detalles técnicos para debugging (NO mostrar al usuario) */
  details: string;
  /** Mensaje original del servidor */
  serverMessage?: string;
}

// ── Constantes de mensajes ──────────────────────────

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR:
    "No se pudo conectar al servidor. Verifica que:\n• Tienes conexión a Internet\n• El servidor backend está ejecutándose\n• La dirección del servidor es correcta",
  TIMEOUT:
    "El servidor tardó demasiado en responder. Puede estar sobrecargado. Intenta de nuevo en unos segundos.",
  SERVER_ERROR:
    "Error interno del servidor. El equipo técnico ha sido notificado. Intenta de nuevo más tarde.",
  UNAUTHORIZED:
    "Credenciales inválidas o sesión expirada.",
  FORBIDDEN:
    "No tienes permisos para realizar esta acción.",
  NOT_FOUND:
    "El recurso solicitado no existe o ha sido eliminado.",
  CONFLICT:
    "Ya existe un recurso con esos datos.",
  VALIDATION_ERROR:
    "Los datos enviados no son válidos. Revisa los campos marcados.",
  BAD_REQUEST:
    "La solicitud contiene datos incorrectos.",
  SESSION_EXPIRED:
    "Tu sesión ha expirado. Inicia sesión de nuevo.",
  UNKNOWN:
    "Ha ocurrido un error inesperado. Intenta de nuevo.",
};

// ── Función principal ───────────────────────────────

/**
 * Parsea cualquier error y devuelve un objeto estructurado
 * con toda la información necesaria para debug y UI.
 */
export function parseApiError(error: unknown, context?: string): ParsedError {
  const prefix = context ? `[${context}] ` : "";

  // ─── AxiosError (la mayoría de errores de API) ────
  if (error instanceof AxiosError) {
    const { response, request, message, code: axiosCode, config } = error;

    const url = config?.url ?? "unknown";
    const method = config?.method?.toUpperCase() ?? "?";
    const baseURL = config?.baseURL ?? "";

    // 1) Sin respuesta del servidor → problema de red
    if (!response) {
      // Timeout
      if (axiosCode === "ECONNABORTED" || message.includes("timeout")) {
        return {
          message: ERROR_MESSAGES.TIMEOUT,
          code: "TIMEOUT",
          details: `${prefix}TIMEOUT | ${method} ${baseURL}${url} | timeout: ${config?.timeout}ms | axiosCode: ${axiosCode}`,
        };
      }

      // Network error (servidor no disponible, DNS, etc.)
      const networkDetail = request
        ? `Request enviado pero sin respuesta`
        : `Request no pudo ser enviado`;

      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: "NETWORK_ERROR",
        details: `${prefix}NETWORK_ERROR | ${method} ${baseURL}${url} | ${networkDetail} | msg: ${message} | code: ${axiosCode} | platform: ${Platform.OS}`,
      };
    }

    // 2) Respuesta del servidor → error HTTP
    const { status, data, headers } = response;
    const serverMsg = extractServerMessage(data);
    const requestId = headers?.["x-request-id"] ?? "n/a";

    const baseDetails = `${prefix}HTTP ${status} | ${method} ${baseURL}${url} | server: "${serverMsg}" | requestId: ${requestId}`;

    switch (status) {
      case 400:
        return {
          message: serverMsg || ERROR_MESSAGES.BAD_REQUEST,
          code: "BAD_REQUEST",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };

      case 401:
        return {
          message: serverMsg || ERROR_MESSAGES.UNAUTHORIZED,
          code: "UNAUTHORIZED",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };

      case 403:
        return {
          message: ERROR_MESSAGES.FORBIDDEN,
          code: "FORBIDDEN",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };

      case 404:
        return {
          message: serverMsg || ERROR_MESSAGES.NOT_FOUND,
          code: "NOT_FOUND",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };

      case 409:
        return {
          message: serverMsg || ERROR_MESSAGES.CONFLICT,
          code: "CONFLICT",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };

      case 422:
        return {
          message: serverMsg || ERROR_MESSAGES.VALIDATION_ERROR,
          code: "VALIDATION_ERROR",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };

      default:
        if (status >= 500) {
          return {
            message: ERROR_MESSAGES.SERVER_ERROR,
            code: "SERVER_ERROR",
            status,
            details: `${baseDetails} | Este es un error del servidor (5xx)`,
            serverMessage: serverMsg,
          };
        }

        return {
          message: serverMsg || ERROR_MESSAGES.UNKNOWN,
          code: "UNKNOWN",
          status,
          details: baseDetails,
          serverMessage: serverMsg,
        };
    }
  }

  // ─── Error nativo de JavaScript ───────────────────
  if (error instanceof Error) {
    return {
      message: ERROR_MESSAGES.UNKNOWN,
      code: "UNKNOWN",
      details: `${prefix}JS Error: ${error.name} — ${error.message}\n${error.stack?.slice(0, 300) ?? ""}`,
    };
  }

  // ─── Error totalmente desconocido ─────────────────
  return {
    message: ERROR_MESSAGES.UNKNOWN,
    code: "UNKNOWN",
    details: `${prefix}Unknown error type: ${String(error)}`,
  };
}

// ── Helpers ─────────────────────────────────────────

/**
 * Extrae el mensaje de error del body de la respuesta,
 * soportando múltiples formatos de API.
 */
function extractServerMessage(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    // Formato del GlobalExceptionHandler: { message, error, status }
    if (typeof obj.message === "string" && obj.message) return obj.message;
    if (typeof obj.error === "string" && obj.error) return obj.error;
    // Formato Spring validation: { errors: [...] }
    if (Array.isArray(obj.errors)) {
      return (obj.errors as string[]).join(". ");
    }
    // Formato genérico
    if (typeof obj.detail === "string") return obj.detail;
  }
  return "";
}

/**
 * Loguea un error parseado en consola con formato estructurado.
 * Útil para debugging rápido.
 */
export function logError(parsed: ParsedError): void {
  console.error(
    `\n🔴 ERROR [${parsed.code}]${parsed.status ? ` HTTP ${parsed.status}` : ""}`,
    `\n   Mensaje: ${parsed.message.split("\n")[0]}`,
    `\n   Detalles: ${parsed.details}`,
    parsed.serverMessage ? `\n   Servidor: ${parsed.serverMessage}` : "",
  );
}

/**
 * Shortcut: parsea + loguea + devuelve el mensaje para UI.
 * Uso:  setError(handleError(err, "Login"))
 */
export function handleError(error: unknown, context?: string): string {
  const parsed = parseApiError(error, context);
  logError(parsed);
  return parsed.message;
}

/**
 * Verifica si un error es un error de red (sin conexión al servidor).
 */
export function isNetworkError(error: unknown): boolean {
  return parseApiError(error).code === "NETWORK_ERROR";
}

/**
 * Verifica si un error es un timeout.
 */
export function isTimeoutError(error: unknown): boolean {
  return parseApiError(error).code === "TIMEOUT";
}

/**
 * Verifica si un error indica sesión expirada.
 */
export function isSessionExpired(error: unknown): boolean {
  const code = parseApiError(error).code;
  return code === "UNAUTHORIZED" || code === "SESSION_EXPIRED";
}

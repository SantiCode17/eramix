/**
 * ────────────────────────────────────────────────────────
 *  resolveMediaUrl.ts — Convierte rutas relativas del
 *  backend (e.g. /uploads/photos/xxx.jpg) en URLs absolutas
 *  para que <Image source={{ uri }} /> funcione.
 * ────────────────────────────────────────────────────────
 */

import { API_BASE_URL } from "@/config/env";

/**
 * Resuelve una URL de media devuelta por el backend.
 *
 * - Si la URL ya es absoluta (http/https/data:), la devuelve tal cual.
 * - Si es una ruta relativa (ej. "/uploads/photos/abc.jpg"),
 *   le prepende API_BASE_URL.
 * - Si es null/undefined/vacía, devuelve undefined.
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Already absolute
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  // Relative path from backend
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

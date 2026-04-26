/**
 * ────────────────────────────────────────────────────────
 *  agentService.ts — API para agente IA mejorado
 * ────────────────────────────────────────────────────────
 */

import { apiClient } from "./client";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AgentTraceItem {
  tool: string;
  input: string;
  output: string;
  durationMs: number;
}

export interface AgentChatResponse {
  sessionId: number;
  reply: string;
  intent: string;
  responseType: string;
  traces: AgentTraceItem[];
}

// ── Chat ────────────────────────────────────────────

export async function sendAgentMessage(
  message: string,
  sessionId?: number,
): Promise<AgentChatResponse> {
  const { data } = await apiClient.post<ApiResponse<AgentChatResponse>>(
    "/v1/agent/chat",
    { message, sessionId },
  );
  return data.data;
}

export const agentApi = {
  sendAgentMessage,
};

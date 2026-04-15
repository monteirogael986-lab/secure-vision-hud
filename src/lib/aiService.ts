// Mock AI service — structured for future OpenAI API integration
import { checkAccess } from "./accessControl";

export interface AIResponse {
  text: string;
  accessGranted: boolean;
  timestamp: Date;
}

// Future: replace with real API call
export async function queryAI(input: string): Promise<AIResponse> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

  const result = checkAccess(input);

  return {
    text: result.message,
    accessGranted: result.granted,
    timestamp: new Date(),
  };
}

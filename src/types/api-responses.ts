// OpenAI API Response Types
export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Claude API Response Types
export interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

// Gemini API Response Types
export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

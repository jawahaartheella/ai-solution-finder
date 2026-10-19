import Groq from "groq-sdk";

export interface AiErrorResponse {
    statusCode: number,
    message: string
}

export function handleAiError(error: unknown): AiErrorResponse {
    if(error instanceof Groq.APIError) {
        const status = error.status;

        if(status === 400) {
            return {
                statusCode: 500,
                message: "We couldn't process your request. Please try again with a clearer description."
            }
        }

        if(status === 401 || status === 403) {
            return {
                statusCode: 503,
                message: "Our AI service is temporarly unavailable please try again later."
            }
        }

        if(status === 429) {
            return {
                statusCode: 429,
                message: "We've currently reached our AI usage limit. Please try again later."
            }
        }

        if(status >= 500) {
            return {
                statusCode: 503,
                message: 'Our AI service is temporarily unavailable. Please try again shortly.',
            };

        }
    }
    return {
        statusCode: 500,
        message:
        'Something went wrong while processing your request. Please try again.',
    };
}
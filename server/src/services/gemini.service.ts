import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

import type { ClientRequirement } from '../models/client-requirement.model.js';
import { datasetVocabulary } from '../data/dataset-vocabulary.js';

export class GeminiService {
    private readonly ai: GoogleGenAI;
    
    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY!
        });
    }

    async extractRequirement(
        userRequest: string
    ): Promise<ClientRequirement> {

        const prompt = `
            You are a requirement analysis assistant for Aayan Infotech's Solution Finder.

            Your task is to understand the user's project requirement and convert it
            into a structured ClientRequirement object.

            IMPORTANT RULES:

            1. Use the provided dataset vocabulary as the canonical terminology.
            2. When the user's wording matches or clearly refers to a vocabulary item,
            use the exact vocabulary value.
            3. Do not invent new industry, platform, feature, or keyword values when
            an appropriate vocabulary value exists.
            4. Only include values that are actually supported by the user's request.
            5. Do not add vocabulary terms simply because they exist in the dataset.
            6. If an industry cannot be determined confidently, return null.
            7. If a business goal can be reasonably identified from the request,
            summarize it clearly. Otherwise return null.
            8. Do not recommend any service or project.
            9. Do not explain your reasoning.
            10. Return only the structured ClientRequirement object.

            DATASET VOCABULARY:

            ${JSON.stringify(datasetVocabulary, null, 2)}

            USER REQUEST:

            ${userRequest}
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const result = JSON.parse(response.text ?? '{}');

        return result as ClientRequirement;
    }

}
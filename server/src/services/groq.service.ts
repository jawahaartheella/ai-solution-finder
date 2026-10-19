import 'dotenv/config';
import Groq from 'groq-sdk';

import type { ClientRequirement } from '../models/client-requirement.model.js';
import { datasetVocabulary } from '../data/dataset-vocabulary.js';
import type { RecommendationResult } from '../models/result-recommendation.model.js';

export class GroqService {
    private readonly groq: Groq;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            throw new Error(
            'GROQ_API_KEY is missing. Check your backend .env file.'
            );
        }

        this.groq = new Groq({ apiKey });
    }

    async extractRequirement(
        userRequest: string
    ): Promise<ClientRequirement> {
        try {
            const response = await this.groq.chat.completions.create({
                model: 'openai/gpt-oss-20b',

                reasoning_effort: 'low',
                max_completion_tokens: 2048,

                messages: [
                    {
                        role: 'system',
                        content: `
                            You are a requirement analysis assistant for an AI Solution Finder.
                            Convert the user's project requirement into a structuredClientRequirement object.
                            IMPORTANT RULES:
                            1. Extract every relevant requirement supported by the user's request.
                            2. Use only canonical values from the provided dataset vocabulary for industry, platforms, features, and keywords.
                            3. Select ALL relevant canonical features and keywords, not just the first few or the most obvious ones.
                            4. Match user intent to equivalent canonical capabilities.
                            For example:
                            - "students watch lessons" may match course/content management.
                            - "AI tutor" may match AI assistants and natural language processing.
                            - "mobile app" may match mobile application development.
                            - "sales dashboard" may match analytics dashboards and reporting.
                            5. Do not add features that are unrelated to the request.
                            6. Identify the primary industry and every explicitly requested platform.
                            7. Keep businessGoal between 100 and 150 characters.
                            8. Do not recommend services or projects.
                            9. Return only a valid JSON object with these fields:
                            industry, platforms, features, keywords, businessGoal.

                            DATASET VOCABULARY:
                            ${JSON.stringify(datasetVocabulary, null, 2)}
                        `.trim(),
                    },
                    {
                        role: 'user',
                        content: `Extract the requirements from this request:\n${userRequest}`,
                    },
                ],

                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'client_requirement',
                        strict: true,
                        schema: {
                            type: 'object',
                            properties: {
                            industry: { type: 'string' },
                            platforms: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            features: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            keywords: {
                                type: 'array',
                                items: { type: 'string' },
                            },
                            businessGoal: { type: 'string' },
                            },
                            required: [
                            'industry',
                            'platforms',
                            'features',
                            'keywords',
                            'businessGoal',
                            ],
                            additionalProperties: false,
                        },
                    },
                },
            });

            const content = response.choices[0]?.message.content;

            if (!content) {
            throw new Error('Groq returned an empty requirement extraction.');
            }

            const requirement = JSON.parse(content) as ClientRequirement;

            return requirement;
        } catch (error) {
            console.error('Groq requirement extraction failed:', error);
            throw error;
        }
    }

    async generateFinalResult(recommendation: RecommendationResult): Promise<RecommendationResult> {
        const prompt = `
            You are an AI solution advisor.

            Based ONLY on the recommendation data below, generate:
            1. whyThisSolution: a concise explanation of why the selected
            solution suits the user's requirements.
            2. aiOpportunities: up to 4 practical AI opportunities relevant
            to the requirements.
            3. whyourcompany: up to 4 practical reasons why should they choose our company relevant
            to the requirements.

            RULES:
            - Do not invent services, projects, or capabilities.
            - Do not calculate or modify scores.
            - Do not change the selected service or project.
            - Do not generate a solution name.
            - Return valid JSON only with these fields:
            - whyThisSolution: string
            - whyOurCompany: string[]
            - aiOpportunities: string[]
            - never merge aiOppurtunities with whyOurCompany or whyThisSolution and vice versa

            RECOMMENDATION DATA:
            ${JSON.stringify(recommendation, null, 2)}
        `;

        try {
            const response = await this.groq.chat.completions.create({
                model: 'openai/gpt-oss-20b',
                messages: [
                    {
                        role: 'system',
                        content: 'Return valid JSON only. Follow the requested schema.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                response_format: { type: 'json_object' },
                max_completion_tokens: 1000,
            });

            const content = response.choices[0]?.message?.content;

            if (!content) {
                throw new Error('Groq returned an empty explanation.');
            }

            const explanation = JSON.parse(content);

            // Keep all calculated recommendation data unchanged.
            return {
                ...recommendation,
                whyThisSolution: explanation.whyThisSolution,
                whyOurCompany: explanation.whyOurCompany,
                aiOpportunities: explanation.aiOpportunities,
            } as RecommendationResult;
        } catch (error) {
            console.error('Groq final-result generation failed:', error);
            throw error;
        }

    }
}

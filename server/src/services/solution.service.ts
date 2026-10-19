import services  from '../data/services.json' with { type: 'json' };
import projects from '../data/projects.json' with { type: 'json' };

import type { ClientRequirement } from "../models/client-requirement.model.js";

import { GroqService } from "./groq.service.js";
import { RecommendationService } from "./recommendation.service.js";
import type { RecommendationResult } from '../models/result-recommendation.model.js';


export class SolutionService {

    constructor(
        private recommendationService: RecommendationService,
        private groqService: GroqService
    ){}

    async generateSolution(clientRequest: string): Promise<any> {
        const formattedAIRequest: ClientRequirement = await this.groqService.extractRequirement(clientRequest) //need user request here
        console.log(formattedAIRequest);
         
        const calculatedRecommendation: RecommendationResult = this.recommendationService.recommend(formattedAIRequest, projects, services);

        const formattedAIResponse: RecommendationResult = await this.groqService.generateFinalResult(calculatedRecommendation);
        console.log(formattedAIResponse);

        const finalResponse = {
            formattedRequest: formattedAIRequest,
            recommendation: formattedAIResponse
        }

        return finalResponse;
    }

}
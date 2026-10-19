import { Router } from "express";
import { SolutionService } from "../services/solution.service.js";
import { SolutionController } from "../controllers/solution.controller.js";
import { RecommendationService } from "../services/recommendation.service.js";
import { GroqService } from "../services/groq.service.js";

const router = Router();

const recommendationService = new RecommendationService();
const groqService = new GroqService();
const solutionService = new SolutionService(recommendationService, groqService);
const solutionController = new SolutionController(solutionService);

router.post('/solution', solutionController.generateSolution.bind(solutionController));

export default router;
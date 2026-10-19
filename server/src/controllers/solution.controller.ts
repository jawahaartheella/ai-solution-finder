import type { Request, Response, NextFunction } from 'express';
import { SolutionService } from "../services/solution.service.js";
import { handleAiError } from '../utils/ai-error-handler.js';

export class SolutionController {
    constructor(private readonly solutionService: SolutionService) {}

    async generateSolution(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { request } = req.body;

            if(typeof request !== 'string' || !request.trim()) {
                res.status(400).json({
                    success: false,
                    message: "Please provide a valid project requirement."
                });

                return;
            }
            const result = await this.solutionService.generateSolution(request);
            res.status(200).json({
                success: true,
                data: result
            });

        } catch(err: unknown) {
            const {statusCode, message} = handleAiError(err);

            res.status(statusCode).json({
                success: false,
                message
            });
        }
    }
}

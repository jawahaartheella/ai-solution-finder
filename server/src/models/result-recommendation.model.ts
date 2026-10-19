import type { Project } from "./project.model.js";
import type { Service } from "./service.model.js";

export interface ServiceRecommendation {
  service: Service;
  matchScore: number;
  reason: string;
  isFallback: boolean;
}

export interface ProjectRecommendation {
  project: Project;
  matchScore: number;
  reason: string;
}

export interface RecommendationResult {
  solutionName: string;
  matchPercentage: number;
  whyThisSolution: string;
  recommendedServices: ServiceRecommendation[];
  relevantProjects: ProjectRecommendation[];
  whyOurCompany: string[];
  aiOpportunities: string[];
}
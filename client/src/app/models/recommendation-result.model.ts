import { Project } from "./project.model";
import { Service } from "./service.model";

export interface ServiceRecommendation {
  service: Service;
  matchScore: number;
  reason: string;
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
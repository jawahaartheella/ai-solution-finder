import type { Project } from "../models/project.model.js";
import type { Service } from "../models/service.model.js";
import type { ClientRequirement } from "../models/client-requirement.model.js";
import type { ProjectRecommendation, RecommendationResult, ServiceRecommendation } from "../models/result-recommendation.model.js";

export class RecommendationService {

  readonly projectWeights = {
    industry: 30,
    platform: 20,
    features: 20,
    keywords: 30
  };

  readonly serviceWeights = {
    industry: 30,
    capabilities: 40,
    keywords: 30
  };
  
  private normalize(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[\s\-&_]/g, '');
  }

  private normalizeArray(arr: string[]) {
    return arr.map(val => this.normalize(val));
  }

  private normalizeRequirement(requirement: ClientRequirement) {
    const normalizedRequirement: ClientRequirement = {
      industry: this.normalize(requirement.industry!),
      platforms: this.normalizeArray(requirement.platforms),
      features: this.normalizeArray(requirement.features),
      keywords: this.normalizeArray(requirement.keywords),
      businessGoal: requirement.businessGoal
    };

    return normalizedRequirement;
  }

  recommend(requirement: ClientRequirement, projects: Project[], services: Service[]): RecommendationResult {
    let normalizedRequirement = this.normalizeRequirement(requirement);
    let finalServices = this.matchServices(normalizedRequirement, services);
    let finalProjects = this.matchProjects(normalizedRequirement, projects);
    let finalMatchingService = finalServices[0]!;
    let result: RecommendationResult = {
      solutionName: finalMatchingService?.service.name,
      matchPercentage: finalMatchingService?.matchScore,
      whyThisSolution: "",
      recommendedServices: finalServices,
      relevantProjects: finalProjects,
      whyOurCompany: [],
      aiOpportunities: []
    }

    return result;
  }

  matchProjects(normalizedRequirement: ClientRequirement, projects: Project[]): ProjectRecommendation[] {
    let matchedProjects: ProjectRecommendation[] = [];
    
    projects.forEach(p => {
      matchedProjects.push({
        project: p,
        matchScore: this.getProjectMatchScore(normalizedRequirement, p),
        reason: ""
      });
    });

    const sortedMatchedProjects = matchedProjects.sort((a,b) => b.matchScore - a.matchScore);

    return sortedMatchedProjects.length ? sortedMatchedProjects.slice(0,3) : [];
  }

  getProjectMatchScore(normalizedRequirement: ClientRequirement, project: Project): number {
    let totalScore = 0;

    let normalizedProjectIndustries = this.normalizeArray(project.industries);
    if(normalizedProjectIndustries.includes(normalizedRequirement.industry!)) {
        totalScore += this.projectWeights.industry;
    }
    totalScore += this.calculateFieldTotal(project.platforms, normalizedRequirement.platforms, this.projectWeights.platform);
    totalScore += this.calculateFieldTotal(project.features, normalizedRequirement.features, this.projectWeights.features);
    totalScore += this.calculateFieldTotal(project.keywords, normalizedRequirement.keywords, this.projectWeights.keywords);

    return totalScore;
  }

  matchServices(normalizedRequirement: ClientRequirement, services: Service[]): ServiceRecommendation[] {
    let matchedServices: ServiceRecommendation[] = [];

    services.forEach(s => {
      matchedServices.push({
        service: s,
        matchScore: this.getServiceMatchScore(normalizedRequirement, s),
        reason: "",
        isFallback: false
      });
    });

    const sortedRecommendedServices = matchedServices.sort((a,b) => b.matchScore - a.matchScore);

    if(!sortedRecommendedServices.length || sortedRecommendedServices[0]!.matchScore < 70) {
      const fallbackService: ServiceRecommendation = {
        service: services.find(s => s.id === "custom-software")!,
        matchScore: 0,
        reason: "",
        isFallback: true
      }
      const filteredServices = sortedRecommendedServices.filter(s => s.service.id !== "custom-software");
      const finalServices = [fallbackService, ...filteredServices.slice(1,3)];
      return finalServices;
    }

    return sortedRecommendedServices.length ? sortedRecommendedServices.slice(0,4) : [];
  }

  getServiceMatchScore(normalizedRequirement: ClientRequirement, service: Service): number {
    let totalScore = 0;

    let normalizedServiceIndustries = this.normalizeArray(service.industries);
    if(normalizedServiceIndustries.includes(normalizedRequirement.industry!)) {
        totalScore += this.serviceWeights.industry;
    }
    totalScore += this.calculateFieldTotal(service.capabilities, normalizedRequirement.features, this.serviceWeights.capabilities);
    totalScore += this.calculateFieldTotal(service.keywords, normalizedRequirement.keywords, this.serviceWeights.keywords);

    return totalScore;
  }

  calculateFieldTotal(filedArr: string[], normalizedDemoReqFields: string[], fieldWeight: number) {
    if(normalizedDemoReqFields.length === 0) {
      return 0;
    }
    let portion = Math.round((100/normalizedDemoReqFields.length)); // calculating portions out of 100%
    const normalizedfieldArr = this.normalizeArray(filedArr);
    let totalPortion = 0;
    normalizedDemoReqFields.forEach(i => {
        if(normalizedfieldArr.includes(i)) {
            totalPortion += portion;
        }
    }); // getting total percentage (x%) of portion the requirement filed includes
    const totalValue = Math.round(((totalPortion/100)*fieldWeight)); // getting x% of fieldWeight to get the value for that field match
    return totalValue;
  }
}
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
    industry: 15,
    platformIntent: 20,
    capabilities: 40,
    keywords: 25
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
    const scoredServices: ServiceRecommendation[] = services
      .map(service => ({
        service,
        matchScore: this.getServiceMatchScore(normalizedRequirement, service),
        reason: "",
        isFallback: false
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    // Only show genuinely strong matches. If none reaches 70%, using the custom-software entry as an explicit fallback
    const strongMatches = scoredServices.filter(item => item.matchScore >= 70);
    const fallback = services.find(service => service.id === "custom-software")!;

    if (strongMatches.length > 0) {
      if(strongMatches.length < 3) {
        strongMatches.push({
          service: fallback,
          matchScore: 0,
          reason: "No service reached the strong-match threshold.",
          isFallback: true
        });
      }
      return strongMatches.slice(0, 5);
    }

    if (!fallback) {
      return [];
    }

    return [{
      service: fallback,
      matchScore: 0,
      reason: "No service reached the strong-match threshold.",
      isFallback: true
    }];
  }

  getServiceMatchScore(normalizedRequirement: ClientRequirement, service: Service): number {
    const requirementIndustry = normalizedRequirement.industry ?? "";
    const serviceIndustries = this.normalizeArray(service.industries);
    const industryScore = serviceIndustries.includes(requirementIndustry)
      ? this.serviceWeights.industry
      : 0;

    const platformTerms = this.normalizeArray([
      service.id,
      service.name,
      ...service.capabilities,
      ...service.keywords
    ]);

    // Infer platform intent from existing services data
    const requestedPlatforms = normalizedRequirement.platforms ?? [];
    let platformScore = 0;
    const isMobileService = platformTerms.some(term =>
      term.includes("mobile") || term.includes("android") || term.includes("ios")
    );
    const isWebService = platformTerms.some(term =>
      term.includes("web") || term.includes("website") || term.includes("portal")
    );

    if (requestedPlatforms.includes("mobile") && isMobileService) {
      platformScore = Math.max(platformScore, 20);
    }
    if (requestedPlatforms.includes("web") && isWebService) {
      // A mobile-specific service should not receive a web bonus 
      if (!isMobileService || service.id === "web-development") {
        platformScore = Math.max(platformScore, 20);
      }
    }

    const capabilityTerms = this.normalizeArray(service.capabilities);
    const requirementFeatures = normalizedRequirement.features ?? [];
    const matchedFeatures = requirementFeatures.filter(feature =>
      capabilityTerms.some(term => this.isTermMatch(feature, term))
    );
    const capabilityDenominator = Math.min(Math.max(requirementFeatures.length, 1), 3);
    const capabilityScore = Math.min(
      this.serviceWeights.capabilities,
      Math.round((new Set(matchedFeatures).size / capabilityDenominator) * this.serviceWeights.capabilities)
    );

    const keywordTerms = this.normalizeArray(service.keywords);
    const requirementKeywords = normalizedRequirement.keywords ?? [];
    const matchedKeywords = requirementKeywords.filter(keyword =>
      keywordTerms.some(term => this.isTermMatch(keyword, term))
    );
    const keywordDenominator = Math.min(Math.max(requirementKeywords.length, 1), 3);
    const keywordScore = Math.min(
      this.serviceWeights.keywords,
      Math.round((new Set(matchedKeywords).size / keywordDenominator) * this.serviceWeights.keywords)
    );

    // A specific AI request should match AI services even when the user did
    // not specify a platform. Existing feature/keyword data drives this.
    const totalScore = industryScore + platformScore + capabilityScore + keywordScore;
    return Math.min(100, totalScore);
  }

  private isTermMatch(requirementTerm: string, serviceTerm: string): boolean {
    if (requirementTerm === serviceTerm) {
      return true;
    }

    // Allow short canonical phrases and common user paraphrases to match,
    // while avoiding broad single-word matches.
    if (requirementTerm.length >= 7 && serviceTerm.length >= 7) {
      return requirementTerm.includes(serviceTerm) || serviceTerm.includes(requirementTerm);
    }

    return false;
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
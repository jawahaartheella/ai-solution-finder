import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { RecommendationResult } from '../models/recommendation-result.model';
import { Observable } from 'rxjs';
import { ClientRequirement } from '../models/client-requirement.model';

@Injectable({
  providedIn: 'root'
})
export class SolutionService {

  private http = inject(HttpClient);
  private apiUrl = 'https://ai-solution-finder.vercel.app/api/solution';

  userRequest = signal<string>('');
  recommendationResult = signal<RecommendationResult | null>(null);
  formattedRequest = signal<ClientRequirement | null>(null);

  private readonly RESULT_KEY = 'RESULT_KEY';

  findSolution(request: string): Observable<any> {
    return this.http.post(this.apiUrl, { request });
  }

  private persistResult() {
    sessionStorage.setItem(this.RESULT_KEY, JSON.stringify({
      request: this.userRequest(),
      recommendation: this.recommendationResult(),
      formattedRequest: this.formattedRequest()
    }));
  }

  restoreResult(): boolean {
    const saved = sessionStorage.getItem(this.RESULT_KEY);

    if(!saved) return false;

    try {
      const parsed = JSON.parse(saved);

      if(!parsed.recommendation || !parsed.formattedRequest || !parsed.request) return false;

      this.userRequest.set(parsed.request);
      this.recommendationResult.set(parsed.recommendation);
      this.formattedRequest.set(parsed.formattedRequest);

      return true;
    } catch {
      sessionStorage.removeItem(this.RESULT_KEY);
      return false;
    }
  }

  clearResult() {
    this.recommendationResult.set(null);
    this.formattedRequest.set(null);
    this.userRequest.set('');
    sessionStorage.removeItem(this.RESULT_KEY);
  }

  // USER REQUEST
  setUserRequest(request: string) {
    this.userRequest.set(request);
    this.persistResult();
  }

  getUserRequest(): string {
    return this.userRequest();
  }

  // FORMATTED REQUEST
  setFormattedRequest(req: ClientRequirement) {
    this.formattedRequest.set(req);
    this.persistResult();
  }

  getFormattedRequest() {
    return this.formattedRequest();
  }

  // FINAL RESULT
  setRecommendationResult(result: RecommendationResult) {
    this.recommendationResult.set(result);
    this.persistResult();
  }

  getRecommendationResult() {
    return this.recommendationResult();
  }
}

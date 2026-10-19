import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

import { LucideBadgeCheck, LucideBuildingComplex, LucideCircleCheck, LucideDynamicIcon, LucideFolderClosed, LucideList, LucideMonitor, LucideMoveLeft, LucideMoveRight, LucideSearchCheck, LucideSparkles, LucideSquarePen, LucideSquareText, LucideTarget, LucideUserRound, LucideWandSparkles, LucideWrench } from '@lucide/angular';

import { SolutionService } from '../../services/solution.service';
import { RecommendationResult } from '../../models/recommendation-result.model';
import { ClientRequirement } from '../../models/client-requirement.model';

@Component({
  selector: 'app-result',
  imports: [NgClass, LucideDynamicIcon, LucideMoveRight, LucideWandSparkles, LucideCircleCheck, LucideUserRound, LucideSearchCheck, LucideSquareText, LucideMoveLeft, LucideFolderClosed, LucideBuildingComplex, LucideMonitor, LucideList, LucideTarget, LucideSparkles, LucideSquarePen, LucideWrench, LucideBadgeCheck],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
  private router = inject(Router);

  solutionService = inject(SolutionService);
  protected readonly colorClasses: Record<string, string> = {
    violet: 'bg-violet-300/20 text-violet-500',
    blue: 'bg-blue-300/20 text-blue-500',
    red: 'bg-red-300/20 text-red-500',
    cyan: 'bg-cyan-300/20 text-cyan-500',
    orange: 'bg-orange-300/20 text-orange-500',
    indigo: 'bg-indigo-300/20 text-indigo-500',
    emerald: 'bg-emerald-300/20 text-emerald-500',
    sky: 'bg-sky-300/20 text-sky-500',
    amber: 'bg-amber-300/20 text-amber-500',
    pink: 'bg-pink-300/20 text-pink-500',
    teal: 'bg-teal-300/20 text-teal-500',
  };

  recommendationResult!: RecommendationResult;
  formattedRequest!: ClientRequirement;
  userRequest: string = "";

  constructor() {
    const restored = this.solutionService.restoreResult();

    if(!restored) {
      this.router.navigateByUrl('/');
      this.solutionService.clearResult();
      return;
    }

    this.userRequest = this.solutionService.getUserRequest();
    this.recommendationResult = this.solutionService.getRecommendationResult()!;
    this.formattedRequest = this.solutionService.getFormattedRequest()!;
  }

  startNewSearch(): void {
    this.solutionService.clearResult();
    this.router.navigateByUrl('/');
  }
}

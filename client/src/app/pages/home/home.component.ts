import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

import { LucideArrowRight, LucideDynamicIcon, LucideFileCheckCorner, LucideFilePenLine, LucideLoader, LucideSparkles } from '@lucide/angular'

import { SolutionService } from '../../services/solution.service';
import { ToastrService } from '../../services/toastr.service';

@Component({
  selector: 'home',
  imports: [FormsModule, NgClass, LucideSparkles, LucideArrowRight, LucideDynamicIcon, LucideFilePenLine, LucideLoader],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private toastrService = inject(ToastrService);

  userRequest: string = "";
  isLoading: boolean = false;
  exampleRequiermentList = [
    {
      id: 1,
      name: "Healthcare application with AI",
      prompt: "We need a healthcare application that allows patients to book appointments, access their medical records, and receive appointment reminders. It should support both web and mobile platforms, with secure access for patients and healthcare staff. We also want an AI assistant that helps staff find relevant patient information quickly, reducing manual work and improving the overall patient experience."
    },
    {
      id: 2,
      name: "E-commerce platform",
      prompt: "We want to build an e-commerce platform where customers can browse products, search and filter the catalog, create wishlists, and complete secure purchases. The system should include inventory management, order tracking, customer accounts, and payment gateway integration. We also want personalized product recommendations and a responsive experience across web and mobile devices, while giving administrators tools to manage products, orders, and sales performance."
    },
    {
      id: 3,
      name: "Real estate CRM",
      prompt: "We need a real estate CRM that helps agents manage property listings, customer enquiries, site visits, and sales leads from one place. Agents should be able to schedule follow-ups, update lead status, and track each customer's journey. Managers need a centralized dashboard with lead conversion rates, sales performance, and team activity reports. The solution should streamline daily workflows, organize customer information, and help the business make better decisions using reliable performance data."
    },
    {
      id: 4,
      name: "Online learning platform",
      prompt: "We want to create an online learning platform where students can register, enroll in courses, watch lessons, track progress, and complete quizzes. Instructors should be able to create courses, upload learning materials, and manage student progress. The platform should work on web and mobile devices, with dashboards for students and instructors. We also want an AI assistant that answers learning questions, explains difficult concepts, and helps students find relevant course content."
    },
  ]
  
  solutionSteps = [
    {
      id: 1,
      icon: LucideFilePenLine,
      title: "Describe",
      description: "Tell us about your idea or bussiness requirement",
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-200/50'
    },
    {
      id: 2,
      icon: LucideSparkles,
      title: "AI Analysis",
      description: "Our AI finds the best matching services and relevant projects.", 
      textColor: 'text-violet-600', 
      bgColor: 'bg-violet-200/50'
    },
    {
      id: 3,
      icon: LucideFileCheckCorner,
      title: "Get Results",
      description: "See recommended solutions with real case studies from our work",
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-200/50'
    },
  ]

  private solutionService = inject(SolutionService);
  private router = inject(Router);

  sendRequest() {
    this.isLoading = true;
    this.solutionService.findSolution(this.userRequest).subscribe({
      next: (res) => {
        this.solutionService.setUserRequest(this.userRequest);
        this.solutionService.setFormattedRequest(res.data.formattedRequest);
        this.solutionService.setRecommendationResult(res.data.recommendation);

        this.router.navigate(['/result']);
        this.isLoading = false;
      }, error: (err) => {
        this.toastrService.displayToastr(err?.error?.message ?? "Something went wrong. Please try again");
        this.isLoading = false;
      }
    })
  }

  setExampleRequirement(prompt: string) {
    this.userRequest = prompt.trim();
  }
}

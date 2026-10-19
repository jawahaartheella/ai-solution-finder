import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { LucidePlus, LucideSparkles } from '@lucide/angular';

import { ToastrComponent } from './components/toastr/toastr.component';
import { ToastrService } from './services/toastr.service';
import { SolutionService } from './services/solution.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastrComponent, LucideSparkles, LucidePlus],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  toastrService = inject(ToastrService);
  solutionService = inject(SolutionService);
  router = inject(Router)

  newSearch() {
    this.solutionService.clearResult();
    this.router.navigateByUrl("/")
  }
}

import { Component, inject } from '@angular/core';

import { LucideX } from '@lucide/angular';

import { ToastrService } from '../../services/toastr.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toastr',
  imports: [LucideX, NgClass],
  templateUrl: './toastr.component.html',
  styleUrl: './toastr.component.scss'
})
export class ToastrComponent {
  toastrService = inject(ToastrService);
}

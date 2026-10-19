import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  showToastr = signal(false);
  isClosing = signal(false);
  message = signal<string>('');
  type = signal<'error' | 'success'>('error');

  displayToastr(message: string) {

    this.type.set('error');
    this.message.set(message);
    this.showToastr.set(true);
    this.isClosing.set(false);

    setTimeout(() => {
      this.closeToastr();
    }, 3000);
  }

  closeToastr() {
    this.showToastr.set(false);
    this.message.set('');
  }
}

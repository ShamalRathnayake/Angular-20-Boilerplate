import { inject, Injectable } from '@angular/core';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private config: Partial<IndividualConfig> = {
    timeOut: 5000,
    positionClass: 'toast-top-right',
    closeButton: false,
    progressBar: true,
    progressAnimation: 'decreasing',
    newestOnTop: true,
    easeTime: 300,
    extendedTimeOut: 3000,
  };

  private toastr = inject(ToastrService);

  success(message: string, title = 'Success') {
    this.toastr.success(message, title, this.config);
  }

  error(message: string, title = 'Error') {
    this.toastr.error(message, title, this.config);
  }

  info(message: string, title = 'Info') {
    this.toastr.info(message, title, this.config);
  }

  warning(message: string, title = 'Warning') {
    this.toastr.warning(message, title, this.config);
  }
}

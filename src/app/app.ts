import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from '@services/notificationService/notification.service';
import { EnvService } from '@services/envService/env.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private envService = inject(EnvService);
  private notificationService = inject(NotificationService);
  protected readonly title: WritableSignal<string>;
  constructor() {
    this.title = signal(`${this.envService.appName} - ${this.envService.isDevelopment}`);
    this.notificationService.success('It works');
  }
}

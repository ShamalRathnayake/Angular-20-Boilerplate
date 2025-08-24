import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EnvService } from './core/services/envService/env.service';
import { LoggerService } from './core/services/loggerService/logger.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title: WritableSignal<string>;
  constructor(private EnvService: EnvService) {
    this.title = signal(`${this.EnvService.appName} - ${this.EnvService.isDevelopment}`);
  }
}

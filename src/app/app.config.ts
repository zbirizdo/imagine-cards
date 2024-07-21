import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { API_KEY, GoogleSheetsDbService } from 'ng-google-sheets-db';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_KEY, useValue: 'AIzaSyDP1lMbL5MDmAHkOgSFMHsVYp86UmCexvI' },
    GoogleSheetsDbService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient()
  ]
};

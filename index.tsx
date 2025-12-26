// @ts-ignore
window.process = { env: { API_KEY: 'ak_8oionbmvjqgge6uksyvi03l0r8gzfvr94g5xjoejcmd8bwp' } }; // Set this locally or via environment variables for development.





import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.

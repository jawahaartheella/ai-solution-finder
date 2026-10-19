import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { LucideBlocks, LucideBrainCircuit, LucideBuildingComplex, LucideChartNoAxesCombined, LucideCloud, LucideCodeXml, LucideMegaphone, LucidePanelsTopLeft, LucideSearchCheck, LucideShoppingCart, LucideSmartphone, provideLucideIcons } from '@lucide/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    provideHttpClient(),
    provideLucideIcons(
      LucideBrainCircuit,
      LucideSmartphone,
      LucideBlocks,
      LucidePanelsTopLeft,
      LucideShoppingCart,
      LucideBuildingComplex,
      LucideChartNoAxesCombined,
      LucideCloud,
      LucideCodeXml,
      LucideMegaphone,
      LucideSearchCheck
    )
  ]
};

import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Toasts } from './shared/toasts';
import { AnalyticsService } from './core/services/analytics.service';
import { UiService } from './core/services/ui.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toasts],
  template: `<router-outlet /><app-toasts />`,
})
export class App {
  constructor() {
    const analytics = inject(AnalyticsService);
    const ui = inject(UiService);
    inject(SeoService).organisation();
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e) => {
        ui.closeAll();
        analytics.pageView((e as NavigationEnd).urlAfterRedirects);
      });
  }
}

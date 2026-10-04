import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .nf { text-align: center; padding: 72px 16px; }
    .cow { width: 160px; margin: 0 auto 18px; animation: float 4s ease-in-out infinite; }
    h1 { font-size: clamp(4rem, 12vw, 7rem); margin: 0; }
    p { color: var(--muted); max-width: 420px; margin: 8px auto 24px; }
  `,
  template: `
    <div class="nf">
      <img class="cow" src="brand/milkyard-cow.png" alt="" />
      <h1>404</h1>
      <h2>Moo-ved or missing!</h2>
      <p>We couldn’t find that page. It may have been moved, or the link might be wrong.</p>
      <div class="row" style="justify-content:center"><a routerLink="/" class="btn">Go home</a><a routerLink="/shop" class="btn btn-outline">Shop products</a></div>
    </div>
  `,
})
export class NotFoundPage {
  constructor() {
    const s = inject(SeoService);
    s.set({ title: 'Page not found' });
    s.noindex();
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-about',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .story { display: grid; gap: 40px; align-items: center; @media (min-width: 960px) { grid-template-columns: 1fr 1fr; } }
    .story img { border-radius: 40px; }
    .lead { font-size: 1.15rem; line-height: 1.8; color: #3d382c; }
    .values { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
    .v { padding: 26px; border-radius: 26px; background: #fff; border: 1px solid var(--line); app-icon { color: var(--ghee); } h3 { margin: 14px 0 6px; } p { margin: 0; color: var(--muted); font-size: .93rem; } }
    .quote { text-align: center; max-width: 820px; margin: 0 auto; font-family: var(--font-display); font-size: clamp(1.6rem, 3.4vw, 2.4rem); line-height: 1.3; font-style: italic; }
    .band { background: var(--ink); color: #fff; border-radius: 36px; padding: clamp(32px, 6vw, 64px); .quote { color: var(--yellow); } p { text-align: center; color: #bbb; margin-top: 16px; } }
  `,
  template: `
    <section class="page-hero"><div class="container"><nav class="breadcrumb"><a routerLink="/">Home</a><span class="sep">/</span><span>About us</span></nav><h1>The MILKYARD story</h1><p>A small Kolkata kitchen with a big love for the way food used to be made.</p></div></section>
    <section class="section container">
      <div class="story">
        <div>
          <span class="eyebrow">Where it began</span>
          <h2>Ghee the way our grandmothers made it.</h2>
          <p class="lead">MILKYARD began with a simple craving — for the ghee, kheer and laddus we grew up with in Kolkata homes. The kind that filled the house with aroma, that was made slowly and shared generously.</p>
          <p class="lead">Today we still cook in small batches: ghee simmered until it turns golden and grainy, kheer reduced by hand, laddus rolled one at a time. We deliver fresh across Kolkata so it reaches you the way it should.</p>
          <div class="placeholder-note mt-2">Replace this copy with MILKYARD’s own founder story, kitchen photos and sourcing details.</div>
        </div>
        <img src="images/hero-spread.svg" alt="MILKYARD ghee, kheer and laddus" style="background:var(--yellow)" />
      </div>
    </section>
    <section class="section container" style="padding-top:0">
      <div class="values">
        <div class="v"><app-icon name="flame" [size]="32" /><h3>Slow & small-batch</h3><p>We never rush. Small batches mean we can watch every kadai.</p></div>
        <div class="v"><app-icon name="leaf" [size]="32" /><h3>Honest ingredients</h3><p>Short ingredient lists you can read — nothing you wouldn’t use at home.</p></div>
        <div class="v"><app-icon name="shield" [size]="32" /><h3>Hygiene first</h3><p>FSSAI-licensed kitchen, sealed food-grade packaging, careful handling.</p></div>
        <div class="v"><app-icon name="heart" [size]="32" /><h3>Made in Kolkata</h3><p>Made here, for here — and delivered fresh to your door.</p></div>
      </div>
    </section>
    <section class="container mb-3"><div class="band"><p class="quote">“If it isn’t good enough for our own family’s table, it doesn’t leave our kitchen.”</p><p>— The MILKYARD family</p></div></section>
    <section class="section container center"><h2>Taste the difference</h2><a routerLink="/shop" class="btn mt-1">Shop our range</a></section>
  `,
})
export class AboutPage {
  constructor() {
    inject(SeoService).set({ title: 'About MILKYARD — Small-batch Dairy Kitchen in Kolkata', path: '/about' });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DbService } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { HomeContent } from '../core/models';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-admin-homepage',
  imports: [FormsModule, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .layout { display: grid; gap: 16px; @media (min-width: 1100px) { grid-template-columns: 1fr 1fr; align-items: start; } }
    .col { display: flex; flex-direction: column; gap: 16px; }
    .preview { border-radius: 18px; background: var(--yellow); padding: 20px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 10px; align-items: center; h2 { font-size: 1.5rem; margin: 6px 0; } p { font-size: .8rem; margin: 0; } img { border-radius: 12px; } }
    .ban { border: 1px solid #ebe6d8; border-radius: 16px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .feat { display: flex; flex-wrap: wrap; gap: 6px; }
    .rows { display: flex; flex-direction: column; gap: 8px; }
  `,
  template: `
    <div class="a-head">
      <div><h1>Homepage</h1><p>Edit the hero, banners, featured products and announcements — changes go live when you save.</p></div>
      <div class="acts"><a href="/" target="_blank" class="btn btn-light btn-sm"><app-icon name="eye" [size]="16" /> Preview store</a><button class="btn btn-sm" (click)="save()">Save changes</button></div>
    </div>
    <div class="layout">
      <div class="col">
        <section class="a-card a-form">
          <h3>Hero banner</h3>
          <div class="preview"><div><span class="eyebrow">{{ h.hero.eyebrow }}</span><h2>{{ h.hero.title }} <em>{{ h.hero.highlight }}</em></h2><p>{{ h.hero.subtitle }}</p></div><img [src]="h.hero.image" alt="" /></div>
          <div class="field"><label for="he">Eyebrow</label><input id="he" class="input" [(ngModel)]="h.hero.eyebrow" name="he" /></div>
          <div class="grid-2">
            <div class="field"><label for="ht">Headline</label><input id="ht" class="input" [(ngModel)]="h.hero.title" name="ht" /></div>
            <div class="field"><label for="hh">Headline (italic highlight)</label><input id="hh" class="input" [(ngModel)]="h.hero.highlight" name="hh" /></div>
          </div>
          <div class="field"><label for="hs">Supporting text</label><textarea id="hs" class="textarea" rows="3" [(ngModel)]="h.hero.subtitle" name="hs"></textarea></div>
          <div class="grid-2">
            <div class="field"><label for="c1">Primary button</label><input id="c1" class="input" [(ngModel)]="h.hero.primaryCta" name="c1" /></div>
            <div class="field"><label for="c2">Secondary button</label><input id="c2" class="input" [(ngModel)]="h.hero.secondaryCta" name="c2" /></div>
          </div>
          <div class="field"><span class="label">Hero image</span><input type="file" accept="image/*" class="input" (change)="upload($event, 'hero')" /></div>
        </section>
        <section class="a-card a-form">
          <h3>Announcement bar</h3>
          <div class="rows">
            @for (a of h.announcements; track $index; let i = $index) { <div class="row"><input class="input" [(ngModel)]="h.announcements[i]" [name]="'an' + i" /><button class="icon-btn" (click)="h.announcements.splice(i, 1)" aria-label="Remove"><app-icon name="trash" [size]="16" /></button></div> }
            <button class="btn btn-light btn-xs" style="align-self:flex-start" (click)="h.announcements.push('')"><app-icon name="plus" [size]="14" /> Add message</button>
          </div>
          <div class="field"><label for="os">Scrolling product strip (separate with ✦)</label><input id="os" class="input" [(ngModel)]="h.offerStrip" name="os" /></div>
        </section>
      </div>
      <div class="col">
        <section class="a-card a-form">
          <h3>Promotional banners</h3>
          @for (b of h.promoBanners; track b.id; let i = $index) {
            <div class="ban">
              <div class="row between"><b>Banner {{ i + 1 }}</b><label class="switch"><input type="checkbox" [(ngModel)]="b.active" [name]="'ba' + i" /> Show</label></div>
              <div class="grid-2">
                <div class="field"><label>Eyebrow</label><input class="input" [(ngModel)]="b.eyebrow" [name]="'be' + i" /></div>
                <div class="field"><label>Colour</label><select class="select" [(ngModel)]="b.tone" [name]="'bt' + i"><option value="ink">Black</option><option value="yellow">Yellow</option><option value="cream">Cream</option></select></div>
                <div class="field span-2"><label>Title</label><input class="input" [(ngModel)]="b.title" [name]="'bti' + i" /></div>
                <div class="field span-2"><label>Text</label><input class="input" [(ngModel)]="b.subtitle" [name]="'bs' + i" /></div>
                <div class="field"><label>Button</label><input class="input" [(ngModel)]="b.cta" [name]="'bc' + i" /></div>
                <div class="field"><label>Link</label><input class="input" [(ngModel)]="b.link" [name]="'bl' + i" /></div>
              </div>
              <div class="row"><input type="file" accept="image/*" (change)="upload($event, b.id)" /><button class="btn btn-ghost btn-xs" (click)="h.promoBanners.splice(i, 1)">Remove</button></div>
            </div>
          }
          <button class="btn btn-light btn-xs" style="align-self:flex-start" (click)="addBanner()"><app-icon name="plus" [size]="14" /> Add banner</button>
        </section>
        <section class="a-card">
          <h3 class="mb-1">Featured products</h3>
          <p class="small muted">Shown in the “Featured” tab on the homepage, in this order.</p>
          <div class="feat">@for (p of db.products(); track p.id) { <button class="chip" [class.active]="h.featuredIds.includes(p.id)" (click)="toggleFeat(p.id)">{{ p.name }}</button> }</div>
          <div class="divider"></div>
          <div class="stack">
            <label class="switch"><input type="checkbox" [(ngModel)]="h.showBestSellers" name="sb" /> Show “Best sellers” tab</label>
            <label class="switch"><input type="checkbox" [(ngModel)]="h.showNewArrivals" name="sn" /> Show “New arrivals” tab</label>
          </div>
        </section>
      </div>
    </div>
  `,
})
export class AdminHomepage {
  protected db = inject(DbService);
  private toast = inject(ToastService);
  protected h: HomeContent = structuredClone(this.db.home());

  toggleFeat(id: string) {
    const i = this.h.featuredIds.indexOf(id);
    i >= 0 ? this.h.featuredIds.splice(i, 1) : this.h.featuredIds.push(id);
  }
  addBanner() {
    this.h.promoBanners.push({ id: this.db.uid('b'), eyebrow: 'New', title: 'New banner', subtitle: '', cta: 'Shop now', link: '/shop', image: 'images/categories/sweets.svg', tone: 'cream', active: true });
  }
  upload(e: Event, target: string) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      if (target === 'hero') this.h.hero.image = String(r.result);
      else {
        const b = this.h.promoBanners.find((x) => x.id === target);
        if (b) b.image = String(r.result);
      }
      this.toast.info('Image ready', 'Click “Save changes” to publish it.');
    };
    r.readAsDataURL(f);
  }
  save() {
    this.h.announcements = this.h.announcements.filter((a) => a.trim());
    this.db.home.set(structuredClone(this.h));
    this.toast.show('Homepage updated', { body: 'Changes are live on the store.' });
  }
}

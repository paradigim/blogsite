import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../core/services/catalog.service';
import { DbService } from '../core/services/db.service';
import { ToastService } from '../core/services/toast.service';
import { Icon } from '../shared/icon';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.scss',
  template: `
    <footer>
      <div class="wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 40 C 240 0 480 0 720 30 C 960 60 1200 70 1440 30 L1440 80 L0 80 Z" fill="#141414"/></svg>
      </div>
      <div class="body">
        <div class="container">
          <div class="news">
            <div>
              <h3>Festive offers & fresh batches, first.</h3>
              <p>Join the MILKYARD list — one or two emails a month, never spam.</p>
            </div>
            <form (ngSubmit)="subscribe()" class="input-group">
              <input type="email" name="email" [(ngModel)]="email" placeholder="Your email address" aria-label="Email address" required />
              <button class="btn btn-yellow" type="submit">Subscribe</button>
            </form>
          </div>
          <div class="cols">
            <div class="brand">
              <img src="brand/milkyard-logo-light.png" alt="MILKYARD Dairy Products" width="200" />
              <p>Small-batch ghee, fresh dairy delicacies and hand-rolled sweets, made and delivered in Kolkata.</p>
              <div class="social">
                <a href="#" aria-label="Instagram"><app-icon name="instagram" /></a>
                <a href="#" aria-label="Facebook"><app-icon name="facebook" /></a>
                <a href="#" aria-label="YouTube"><app-icon name="youtube" /></a>
                <a [href]="'https://wa.me/' + db.settings().whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp"><app-icon name="whatsapp" /></a>
              </div>
            </div>
            <div>
              <h4>Shop</h4>
              @for (c of catalog.categories(); track c.id) { <a [routerLink]="['/category', c.slug]">{{ c.name }}</a> }
            </div>
            <div>
              <h4>Help</h4>
              <a routerLink="/account/orders">Track my order</a>
              <a routerLink="/policies/shipping">Shipping & delivery</a>
              <a routerLink="/policies/cancellation">Cancellation</a>
              <a routerLink="/policies/refund">Refunds & returns</a>
              <a routerLink="/faq">FAQ</a>
              <a routerLink="/contact">Contact us</a>
            </div>
            <div>
              <h4>Get in touch</h4>
              @for (p of db.settings().phones; track p) { <a [href]="'tel:' + p.replaceAll(' ', '')" class="ic"><app-icon name="phone" [size]="16" /> {{ p }}</a> }
              <a [href]="'mailto:' + db.settings().email" class="ic"><app-icon name="mail" [size]="16" /> {{ db.settings().email }}</a>
              <span class="ic"><app-icon name="pin" [size]="16" /> Delivering across Kolkata</span>
              <span class="ic"><app-icon name="clock" [size]="16" /> {{ db.settings().hours }}</span>
            </div>
          </div>
          <div class="legal">
            <div class="fssai"><span class="badge badge-yellow">FSSAI</span> Lic. No. {{ db.settings().fssai }}</div>
            <nav>
              <a routerLink="/policies/privacy">Privacy</a>
              <a routerLink="/policies/terms">Terms</a>
              <a routerLink="/policies/shipping">Shipping</a>
              <a routerLink="/policies/refund">Refunds</a>
            </nav>
            <span>© {{ year }} MILKYARD Dairy Products. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected catalog = inject(CatalogService);
  protected db = inject(DbService);
  private toast = inject(ToastService);
  protected year = new Date().getFullYear();
  protected email = '';
  subscribe() {
    if (!/^\S+@\S+\.\S+$/.test(this.email)) return this.toast.error('Please enter a valid email address');
    this.toast.show('You’re on the list!', { body: 'Look out for our next fresh batch.' });
    this.email = '';
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PiggyBankComponent } from './piggy-bank.component';
import { PiggyBankRoutingModule } from './piggy-bank-routing.module';
import { SuiModule } from 'ng2-semantic-ui';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PiggyBankComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SuiModule,
    PiggyBankRoutingModule,
  ],
})
export class PiggyBankModule {}

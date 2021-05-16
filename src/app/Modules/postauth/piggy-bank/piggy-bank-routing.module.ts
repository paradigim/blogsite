import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PiggyBankComponent } from './piggy-bank.component';

const routes: Routes = [
  {
    path: '',
    component: PiggyBankComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PiggyBankRoutingModule {}

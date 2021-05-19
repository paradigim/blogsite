import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PiggyBankComponent } from './piggy-bank.component';
import { PiggyBankRoutingModule } from './piggy-bank-routing.module';
import { SuiModule } from 'ng2-semantic-ui';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
// import { ChartComponent } from 'src/app/Components/chart/chart.component';
import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
  declarations: [PiggyBankComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SuiModule,
    PiggyBankRoutingModule,
    SharedModule,
    NgApexchartsModule
  ],
})
export class PiggyBankModule {}

import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { DateService } from 'src/app/services/date.service';
import { TermsListFactory } from '../../../__mocks__/TermsListFactory';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexGrid,
  ApexTitleSubtitle,
  ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  colors: string[];
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-piggy-bank',
  templateUrl: './piggy-bank.component.html',
  styleUrls: ['./piggy-bank.component.css'],
})
export class PiggyBankComponent implements OnInit, OnDestroy {
  @ViewChild('earning') earning: ElementRef;
  @ViewChild('chartBlock') chartBlock: ElementRef;

  readonly FINAL_STEP_NO = 3;
  isPaymentModeOn = false;
  isPaymentTermsModalOpen = false;
  currentAcceptedStepIndex = 1;
  currentStepContent = '';
  termsList = TermsListFactory.createTerms();
  monthAndYear = new FormControl('');
  ngUnsubscribe = new Subject();
  incomeStatus = true;
  earningBlockHeight = 0;
  chartBlockWidth = 0;

  public chartOptions: Partial<ChartOptions> = {
    markers: {
      size: 6,
      hover: {
        size: 10
      }
    }
  };

  constructor(
    private dateService: DateService,
    private data: DataExchangeService,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.data.setPageStatus(true);
    this.setTermContent(0);
    this.listenFiltersChange();
    this.setDefaultFilterValues();
  }

  initChart() {
    this.chartOptions = {
      series: [
        {
          name: "Earnings",
          data: [0, 10, 20, 40, 60, 80, 100]
        }
      ],
      chart: {
        width: this.chartBlockWidth,
        height: this.earningBlockHeight,
        type: "line",
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "straight"
      },
      title: {
        text: "Your earning statistics",
        align: "center"
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep"
        ]
      },
      yaxis: {
        title: {
          text: "Earnings per month"
        },
      },
    };
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.earningBlockHeight = this.earning.nativeElement.offsetHeight;
      this.chartBlockWidth = this.chartBlock.nativeElement.offsetWidth;
      this.initChart()
    }, 0);
  }

  setDefaultFilterValues() {
    this.monthAndYear.setValue(
      this.dateService.formatByPattern(new Date(), 'yyyy-MM')
    );
  }

  setTermContent(termIndex) {
    this.currentStepContent = this.termsList[termIndex].content;
  }

  togglePayment() {
    this.isPaymentModeOn = false;
    this.isPaymentTermsModalOpen = true;
  }

  toggleModal() {
    this.isPaymentTermsModalOpen = !this.isPaymentTermsModalOpen;
  }

  nextStep() {
    if (this.currentAcceptedStepIndex === this.FINAL_STEP_NO) {
      this.isPaymentModeOn = true;
      this.isPaymentTermsModalOpen = false;
      return;
    }

    this.termsList.forEach((term) => {
      if (term.id === this.currentAcceptedStepIndex) {
        term.isAccepted = true;
      }
    });

    this.setTermContent(this.currentAcceptedStepIndex);
    this.currentAcceptedStepIndex++;
  }

  listenFiltersChange() {
    this.monthAndYear.valueChanges
      .pipe(distinctUntilChanged())
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((value) => {
        
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

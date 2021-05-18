import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DateService } from 'src/app/services/date.service';
import { TermsListFactory } from '../../../__mocks__/TermsListFactory';

@Component({
  selector: 'app-piggy-bank',
  templateUrl: './piggy-bank.component.html',
  styleUrls: ['./piggy-bank.component.css'],
})
export class PiggyBankComponent implements OnInit, OnDestroy {
  readonly FINAL_STEP_NO = 3;
  isPaymentModeOn = false;
  isPaymentTermsModalOpen = false;
  currentAcceptedStepIndex = 1;
  currentStepContent = '';
  termsList = TermsListFactory.createTerms();
  monthAndYear = new FormControl('');
  ngUnsubscribe = new Subject();
  incomeStatus = true;

  constructor(private dateService: DateService) {}

  ngOnInit(): void {
    this.setTermContent(0);
    this.listenFiltersChange();
    this.setDefaultFilterValues();
  }

  setDefaultFilterValues() {
    this.monthAndYear.setValue(
      this.dateService.formatByPattern(new Date(), 'yyyy-MM')
    );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
        console.log(`[monthAndYear] -> `, value);
      });
  }
}

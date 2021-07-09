import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbarmodal',
  templateUrl: './snackbarmodal.component.html',
  styleUrls: ['./snackbarmodal.component.css']
})
export class SnackbarmodalComponent implements OnInit {
  @Input() text = '';
  @Output() snackbarClose = new EventEmitter<boolean>();

  snackbarRef: any;

  constructor(
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.openSnackBar();
  }

  openSnackBar() {
    this.snackbarRef = this.snackbar.open(this.text, 'Ok', {
      duration: 2000
    });

    this.snackbarRef.afterDismissed()
    .subscribe(() => {
      this.snackbarClose.emit(true);
    });
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
//import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbarmodal',
  templateUrl: './snackbarmodal.component.html',
  styleUrls: ['./snackbarmodal.component.css']
})
export class SnackbarmodalComponent implements OnInit {
  @Input() text = '';
  constructor(
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.openSnackBar();
  }

  openSnackBar() {
    this.snackbar.open(this.text, 'Ok', {
      duration: 2000
    });
  }

}

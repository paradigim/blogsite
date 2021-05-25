import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-snackbarmodal',
  templateUrl: './snackbarmodal.component.html',
  styleUrls: ['./snackbarmodal.component.css']
})
export class SnackbarmodalComponent implements OnInit {

  constructor(
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.openSnackBar();
  }

  openSnackBar() {
    this.snackbar.open('posted', '');
  }

}

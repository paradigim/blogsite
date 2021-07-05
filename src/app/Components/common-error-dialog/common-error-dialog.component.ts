import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-common-error-dialog',
  templateUrl: './common-error-dialog.component.html',
  styleUrls: ['./common-error-dialog.component.css']
})
export class CommonErrorDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {message: string}
  ) { }

  ngOnInit(): void {
  }

}

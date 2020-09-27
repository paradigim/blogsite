import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-blog-modal',
  templateUrl: './blog-modal.component.html',
  styleUrls: ['./blog-modal.component.css']
})
export class BlogModalComponent implements OnInit {
  @Output() modalStatus = new EventEmitter();
  @ViewChild('modal') modal: any;
  @ViewChild('textarea') textarea: any;

  content: string;
  isPlaceholder = true;
  postForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private services: InteractionService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.postForm = this.formBuilder.group({
      content: [''],
    });
  }

  cancelBlog(): void {
    this.modal.deny();
    this.modalStatus.emit();
  }

  statusPlaceholder(e): void {
    e.preventDefault();
    const val = (e.target.value).trim();

    if (val === '' || val === undefined || val === null) {
      this.isPlaceholder = !this.isPlaceholder;
      console.log('isPlaceholder: ', this.isPlaceholder);
    }
    console.log('Form: ', this.postForm);
  }


  // submitted = false;
  // get f() { return this.postForm.controls; }

  postBlog(): void {
    this.services.post(this.postForm.value).then(res => {
     // this.router.navigate([''])
    }).catch(err => {
      alert(err);
    });
    this.modal.approve();
    this.modalStatus.emit();
  }
}

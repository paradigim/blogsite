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
  content : string;

  isPlaceholder = true;
  postForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private services: InteractionService, public router: Router) { }

  ngOnInit(): void {
    console.log('ENTER..............');
    this.postForm = this.formBuilder.group({
      contents:['',Validators.required],
    });


  }

  cancelBlog(): void {
    this.modal.deny();
    this.modalStatus.emit();
  }
  submitted = false;
  get f() { return this.postForm.controls; }
  
  postBlog(): void {
    this.postForm.setValue({
      contents: 'Hello data',
  });
  
    //this.postForm.value();
    this.services.post(this.postForm.value).then(res => {
      //alert(res);
     // this.router.navigate([''])
    }).catch(err => {
      alert(err);
    })  
   // this.modal.approve();
    //this.modalStatus.emit();
  }

  statusPlaceholder(e): void {
    console.log(e);
    e.preventDefault();
    if (e.target.value === '' || e.target.value === undefined || e.target.value === null) {
      this.isPlaceholder = !this.isPlaceholder;
    }
  }

}

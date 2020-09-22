import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms'
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm : FormGroup;

  constructor(private fb:FormBuilder, private service : InteractionService) { }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(){
    this.loginForm = this.fb.group({
      email:['', Validators.required],
      password: ['', Validators.required]
    })
  }

  submit(){
    console.log(this.loginForm);
    this.service.login(this.loginForm.value)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err)
      })
  }

}

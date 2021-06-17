import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms'
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataExchangeService } from 'src/app/services/data-exchange.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm : FormGroup;
  isErrorEmail = false;
  isErrorPassword = false;

  constructor(
    private fb:FormBuilder, 
    public interaction : InteractionService,
    private authService: AuthService,
    private router: Router
  ) { }

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
    const formValue = {
      email: this.loginForm.get('email').value,
      password: this.loginForm.get('password').value
    }
    this.authService.login(formValue)
      .subscribe(res => {
        if (res.authenticated) {
          if (res.jwtToken) {
            this.interaction.storeJwtInLocalStorage(res.jwtToken);
            const localStorageData = this.interaction.getJwtFromLocalStorage();
          }
          this.authService.getUser()
            .subscribe(user => {
              this.router.navigate(['home']);
            }); 
        }
      },
      err => {
        console.log('ERROR: ', err);
        if (err.error.field === 'email') {
          this.isErrorEmail = true;
        }

        if (err.error.field === 'password') {
          this.isErrorPassword = true;
        }
      })
  }

  handleChange(e, field) {
    if (field === 'email') {
      this.isErrorEmail = false;
    } else if (field === 'password') {
      this.isErrorPassword = false;
    }
    
  }

}

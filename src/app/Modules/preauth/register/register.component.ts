import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { MustMatch } from './MustMatch';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterUser } from 'src/app/Models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  submitted = false;
  responseError = false;
  errorMsg = '';
  isEmailExist = false;
  existMailUser = '';

  get f() { 
    return this.registerForm.controls; 
  }

  constructor(
    private formBuilder: FormBuilder, 
    private interaction: InteractionService, 
    private authService: AuthService,
    public router: Router
  ) { }
  
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      dob: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cpassword: ['', [Validators.required, Validators.minLength(6)]]
    },
   {
      validator: MustMatch('password', 'cpassword')
    })
  }

  

  async register() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }
    else {
      const formValue = {
        name: this.registerForm.get('name').value,
        email: this.registerForm.get('email').value,
        gender: this.registerForm.get('gender').value,
        dob: this.registerForm.get('dob').value,
        password: this.registerForm.get('password').value,
      }
      const uniqueUserId = await this.authService.createUniqueUserName(this.registerForm.get('name').value);
      
      this.authService.signUp(formValue, uniqueUserId)
      .subscribe(res => {
        this.interaction.storeJwtInLocalStorage(res);
        
        this.submitted = false;
        this.responseError = false;
        this.errorMsg = '';
        this.router.navigate(['home'])
      },
      (err) => {
        this.submitted = false;
        this.responseError = true;
        this.isEmailExist = true;
        this.existMailUser = err.error.message;
      })
    }
  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }
}
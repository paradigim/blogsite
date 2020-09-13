import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';

// import custom validator to validate that password and confirm password fields match
//import { MustMatch } from './_helpers/must-match.validator';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup
  constructor(private formBuilder: FormBuilder, private services: InteractionService, public router: Router) { }
  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      name: new FormControl(''),
      email: new FormControl(''),
      gender: new FormControl(''),
      dob: new FormControl(''),
      password: new FormControl(''),
      cpassword: new FormControl('')
    })

  }

  submitted = false;
  get f() { return this.registerForm.controls; }

  register() {
    this.submitted = true;

    if (this.registerForm.invalid) {


    }
    else {
      console.log("register" + JSON.stringify(this.registerForm.value, null, 4));
      this.services.register(this.registerForm.value).then(res => {
        console.log(res);
        this.router.navigate([''])
      }).catch(err => {
        console.log(err)
      })
      return;
    }

  }


  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }
}
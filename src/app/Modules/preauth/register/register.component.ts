import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { InteractionService } from 'src/app/services/interaction.service';
import { Router } from '@angular/router';
import { MustMatch } from './MustMatch';

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
      name:['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender:[''],
      dob: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cpassword: ['', [Validators.required, Validators.minLength(6)]]
    },
   {
      validator: MustMatch('password', 'cpassword')
  })
  }

  // createForm(){
  //   this.registerForm = this.formBuilder.group({
  //     name:['', Validators.required],
  //     email: ['', Validators.required],
  //     dob: ['', Validators.required],
  //     password: ['', Validators.required],
  //     cpassword: ['', Validators.required]
  //   })
  // }

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
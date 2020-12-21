import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditProfileComponent } from 'src/app/Components/edit-profile/edit-profile.component';
import { SuiModule } from 'ng2-semantic-ui';
import { EditProfileModalComponent } from 'src/app/Components/edit-profile-modal/edit-profile-modal.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProfileComponent,
    EditProfileComponent,
    EditProfileModalComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    SuiModule,
    ReactiveFormsModule
  ]
})
export class ProfileModule { }

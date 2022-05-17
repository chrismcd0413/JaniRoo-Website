import {
  Component,
  Inject,
  Injectable,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';


@Component({
  selector: 'app-new-user-modal',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css'],
})
@Injectable()
export class NewUserModalComponent implements OnInit, OnDestroy {
  userForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<NewUserModalComponent>,
    private fb: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {}

  ngOnInit(): void {
    this.userForm = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl('', {
        validators: [Validators.required],
      }),
      role: new FormControl('', {
        validators: [Validators.required],
      }),
      password: new FormControl('', {
        validators: [Validators.required],
      }),
    });

  }
  ngOnDestroy(): void {

  }
  onSubmit() {
    const data = {
      email: this.userForm.value.email,
      emailVerified: false,
      phoneNumber: '+1' + this.userForm.value.phone.toString(),
      password: this.userForm.value.password,
      displayName: this.userForm.value.name,
      disabled: false
    }
    this.fb.createUser(data)
    .subscribe(u => {
      this.fb.createUserProfile(u, this.userForm.value.role, this.userForm.value.phone)
      .then(profile => {
        this.closeDialog(true, profile);
        console.log('Created User Profile: ', profile);
      })
      .catch(error => this.fb.displayError(error.message))
    }, (err) => this.fb.displayError(err.message));
  }
  closeDialog(created, profile) {
    this.dialogRef.close({
      userCreated: created,
      profile: profile
    })
  }

}

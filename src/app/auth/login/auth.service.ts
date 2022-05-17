import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/Shared Services/firestore.service';
import { UiService } from 'src/app/Shared Services/ui.service';
import { UserInfo } from 'src/app/Shared Services/user-info.service';
import { getAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;
  private userDataSub: Subscription;
  private userInfo;
  private firstRun = true;

  get currentUser() {
    return { ...this.userInfo };
  }
  constructor(
    private router: Router,
    private fbAuth: AngularFireAuth,
    private snackBar: MatSnackBar,
    private uiService: UiService,
    private userInfoService: UserInfo,
    private fb: FirebaseService
  ) {}

  createNewUser() {}

  login(email: string, password: string) {
    this.fbAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        this.snackBar.open(error.message, null, {
          duration: 3000,
        });
      });
  }

  logOut() {
    this.fbAuth.signOut();
  }

  initAuthListener() {
    this.fbAuth.authState.subscribe((user) => {
      if (user) {
        this.isAuthenticated = true;
        // this.userDataSub = this.fb.fetchUserProfile(user.uid)
        // .subscribe(u => {
        //   console.log(u);
        //   this.userInfoService.setUser(u[0]);
        // });
        this.setUserData(user);
        this.authChange.next(true);
      } else {
        this.unsubscribeUserDataSub();
        this.isAuthenticated = false;
        this.authChange.next(false);
        this.router.navigate(['/login']);
      }
    });
  }
  unsubscribeUserDataSub() {
    this.userInfoService.clearUser();
    if (this.userDataSub) {
      this.userDataSub.unsubscribe();
    }
  }
  isAuth() {
    return this.isAuthenticated;
  }

  setUserData(user) {
    console.log(user);
    this.fb.fetchUserProfile(user.uid).subscribe((p) => {
      this.userInfoService.setUser(p);
      this.fb.fetchCompanyAccounts().subscribe((a) => {
        const accounts = a;
        this.fb.fetchCompanyLocations().subscribe((l) => {
          this.userInfoService.setAccountsAndLocation(accounts, l);
        });
      });
      this.fb.fetchCompanyUsers().subscribe((u) => {
        this.userInfoService.setCompanyUsers(u);
      });
      if (this.firstRun) {
        this.router.navigate(['/']);
        this.firstRun = false;
      }
    });
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Subscription } from 'rxjs';
import { UiService } from './Shared Services/ui.service';
import { AuthService } from './auth/login/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Website';
  showHeader = false;

  private authSub: Subscription;

  constructor(
    private uiService: UiService,
    private authService: AuthService
  ){}
  ngOnInit(): void {
    //initialize Auth Listener
    this.authService.initAuthListener();
    //setup Show Header Sub
    this.authSub = this.authService.authChange.subscribe(bool => this.showHeader = bool);
  }
  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}

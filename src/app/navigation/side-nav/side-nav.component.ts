import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/auth/login/auth.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();
  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }
  onClose() {
    this.closeSidenav.emit();
  }
  onLogOut(){
    this.closeSidenav.emit();
    this.authService.logOut();
  }
}

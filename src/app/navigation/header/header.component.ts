import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { UiService } from 'src/app/Shared Services/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();


  constructor(
    private logo: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private uiService: UiService
  ) {
    this.logo.addSvgIcon(
      'logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/Logo/2.svg")
    )
  }

  ngOnInit(): void {

  }
  onToggleSidenav() {
    this.sidenavToggle.emit();
  }
}

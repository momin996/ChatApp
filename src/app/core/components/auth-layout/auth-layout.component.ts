import { Component } from '@angular/core';
import { CustomizerSettingsService } from '../../services/customizer-settings.service';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent {
  constructor(public themeService: CustomizerSettingsService) {}
}

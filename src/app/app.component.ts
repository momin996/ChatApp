import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomizerSettingsService } from './core/services/customizer-settings.service';
import { ToggleService } from './core/components/header/toggle.service';
import { AuthFacade } from './auth/auth.facade';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'User Management';

    isToggled = false;
    isLoggedIn = false;
    isLoadingComplete = false;

    constructor(
        private router: Router,
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private authFacade: AuthFacade,
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.authFacade.isAuthenticated().subscribe(isAuthenticated => this.isLoggedIn=isAuthenticated);
        this.authFacade.isLoading().subscribe(isLoading => this.isLoadingComplete = !isLoading);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    hideHeader(){
        return !(this.isLoggedIn && this.router.url !== '/error-500');
    }

    isDarkTheme(){
        return this.themeService.isDark()
    }

}
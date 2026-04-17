import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomizerSettingsService } from './core/services/customizer-settings.service';
import { ToggleService } from './core/components/header/toggle.service';
import { AuthFacade } from './auth/auth.facade';
import { pairwise, filter } from 'rxjs';

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

        this.authFacade.init();

        const isAuth$ = this.authFacade.isAuthenticated();

        // Track auth state for UI
        isAuth$.subscribe(isAuthenticated => this.isLoggedIn = isAuthenticated);

        this.authFacade.isLoading()
            .subscribe(isLoading => this.isLoadingComplete = !isLoading);
        
        // Detect logout transition (true → false)
        isAuth$
            .pipe(
                pairwise(),
                filter(([prev, curr]) => prev === true && curr === false)
            )
            .subscribe(() => {
                this.router.navigate(['/auth/logout']);
            });
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
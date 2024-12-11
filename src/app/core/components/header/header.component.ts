import { Component, HostListener, OnInit } from '@angular/core';
import { ToggleService } from './toggle.service';
import { CustomizerSettingsService } from '../../services/customizer-settings.service';
import { AuthFacade } from 'src/app/auth/auth.facade';
import { User } from "src/app/auth/models/user.model";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    isToggled = false;
    user: User;
    
    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private authFacade: AuthFacade
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    ngOnInit(): void {
        this.authFacade.getUser().subscribe(user => {
            console.log(user);
            
            if(user!=null) this.user=user;
        });
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logoutUser() {
        this.authFacade.logout();
    }

}
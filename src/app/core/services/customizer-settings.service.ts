import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class CustomizerSettingsService {

    private isDarkTheme: boolean;
    private isSidebarDarkTheme: boolean;
    private isRightSidebarTheme: boolean;
    private isHideSidebarTheme: boolean;
    private isHeaderDarkTheme: boolean;
    private isCardBorderTheme: boolean;
    private isCardBorderRadiusTheme: boolean;
    private isRTLEnabledTheme: boolean;

    constructor(private localStorageService: LocalStorageService) {
        this.isDarkTheme = this.localStorageService.getValue('isDarkTheme')!;
        this.isSidebarDarkTheme = this.localStorageService.getValue('isSidebarDarkTheme')!;
        this.isRightSidebarTheme = this.localStorageService.getValue('isRightSidebarTheme')!;
        this.isHideSidebarTheme = this.localStorageService.getValue('isHideSidebarTheme')!;
        this.isHeaderDarkTheme = this.localStorageService.getValue('isHeaderDarkTheme')!;
        this.isCardBorderTheme = this.localStorageService.getValue('isCardBorderTheme')!;
        this.isCardBorderRadiusTheme = this.localStorageService.getValue('isCardBorderRadiusTheme')!;
        this.isRTLEnabledTheme = this.localStorageService.getValue('isRTLEnabledTheme')!;
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.localStorageService.setValue('isDarkTheme', this.isDarkTheme);
    }

    toggleSidebarTheme() {
        this.isSidebarDarkTheme = !this.isSidebarDarkTheme;
        this.localStorageService.setValue('isSidebarDarkTheme', this.isSidebarDarkTheme);
    }

    toggleRightSidebarTheme() {
        this.isRightSidebarTheme = !this.isRightSidebarTheme;
        this.localStorageService.setValue('isRightSidebarTheme', this.isRightSidebarTheme);
    }

    toggleHideSidebarTheme() {
        this.isHideSidebarTheme = !this.isHideSidebarTheme;
        this.localStorageService.setValue('isHideSidebarTheme', this.isHideSidebarTheme);
    }

    toggleHeaderTheme() {
        this.isHeaderDarkTheme = !this.isHeaderDarkTheme;
        this.localStorageService.setValue('isHeaderDarkTheme', this.isHeaderDarkTheme);
    }

    toggleCardBorderTheme() {
        this.isCardBorderTheme = !this.isCardBorderTheme;
        this.localStorageService.setValue('isCardBorderTheme', this.isCardBorderTheme);
    }

    toggleCardBorderRadiusTheme() {
        this.isCardBorderRadiusTheme = !this.isCardBorderRadiusTheme;
        this.localStorageService.setValue('isCardBorderRadiusTheme', this.isCardBorderRadiusTheme);
    }

    toggleRTLEnabledTheme() {
        this.isRTLEnabledTheme = !this.isRTLEnabledTheme;
        this.localStorageService.setValue('isRTLEnabledTheme', this.isRTLEnabledTheme);
    }

    isDark() {
        return this.isDarkTheme;
    }

    isSidebarDark() {
        return this.isSidebarDarkTheme;
    }

    isRightSidebar() {
        return this.isRightSidebarTheme;
    }

    isHideSidebar() {
        return this.isHideSidebarTheme;
    }

    isHeaderDark() {
        return this.isHeaderDarkTheme;
    }

    isCardBorder() {
        return this.isCardBorderTheme;
    }

    isCardBorderRadius() {
        return this.isCardBorderRadiusTheme;
    }

    isRTLEnabled() {
        return this.isRTLEnabledTheme;
    }

    private isToggled = new BehaviorSubject<boolean>(false);

    get isToggled$() {
        return this.isToggled.asObservable();
    }

    toggle() {
        this.isToggled.next(!this.isToggled.value);
    }

}
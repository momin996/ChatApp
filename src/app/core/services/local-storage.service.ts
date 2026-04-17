import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  constructor() { }

  getValue(key: string) {
    const value = localStorage.getItem(key);
    if(value==null) return null;
    return JSON.parse(value);
  }

  setValue(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
  }

}

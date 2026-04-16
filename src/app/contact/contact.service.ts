import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from '../core/services/app-config.service';
import { ContactDto } from './contact.type';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl: string;

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
  }

  /**
   * Paged contacts endpoint.
   * Example: GET `${apiBase}/Contacts?skip=0&take=10`
   */
  public getContactsPaged(skip: number, take: number, search?: string | null): Observable<ContactDto[]> {
    const apiEndpoint = `${this.apiUrl}/Contacts`;
    return this.http.get<ContactDto[]>(apiEndpoint, {
      params: {
        skip: skip.toString(),
        take: take.toString(),
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    });
  }
}

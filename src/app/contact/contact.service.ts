import { Injectable } from '@angular/core';
import { AppConfigService } from '../core/services/app-config.service';
import { User } from '../auth/models/user.model';
import { ContactDto, ContactListingResponse } from './contact.type';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private apiUrl: string;

  constructor(private http: HttpClient, appConfig: AppConfigService) {
    this.apiUrl = appConfig.getAPIUrl();
  }

  public getContacts() : Observable<ContactListingResponse> {
    const apiEndpoint = `${this.apiUrl}/Users/Contacts`;
    return this.http.get<ContactListingResponse>(apiEndpoint)
            // .pipe(map(r => r.response));
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

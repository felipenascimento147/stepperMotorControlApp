import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  api = "http://192.168.15.81:80";

  constructor(
    private httpClient: HttpClient
  ) { }

  confirmMoviment() {
    return this.httpClient.get(`${this.api}/?step%2F=1000&speed%2F=100`);
  }
}

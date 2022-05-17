import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

export interface TZRequest{
  dstOffset: number,
  rawOffset: number,
  status: string,
  timeZoneId: string,
  timeZoneName: string
}
@Injectable({providedIn: 'root'})
export class TimeZoneService {

  constructor(
    private http: HttpClient
  ) {}

  getCurrentTzId(geo){
    const ts = new Date().getTime() / 1000;
    const requestUrl = 'https://maps.googleapis.com/maps/api/timezone/json?location=' +
    geo.lat + '%2C' + geo.lng + '&timestamp=' + ts
    + '&key=AIzaSyCcjcAtxm6a8AVdJXIMS6UG9qHZbuNGfBU';
    return this.http.get<TZRequest>(requestUrl);
  }
}

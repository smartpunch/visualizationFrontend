import { Injectable } from '@angular/core';
import { StorageManagerService } from './storagemanager.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * DESCRIPTION:
 * BackendconnectorService is used to connect to backend server for data transfer.
*/

@Injectable({
  providedIn: 'root'
})
export class BackendconnectorService {

  private hostAddr = '';  // Stores the host address (loaded from the browsers localStorage)
  // tslint:disable-next-line:max-line-length
  private generalRequestBodyObject = { 'username': '', 'password': '', 'statsData': '' }; // Stores the basic structure of the request body (containing username and password)
  /**
   * General options for connections using the http protocol
   */
  private httpOptions: { headers: any, responseType: any } = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    responseType: 'text' as 'json'
  };

  /**
   * General constructor
   * @param http HttpClient injection
   * @param localStorage StorageManagerService injection
   */
  constructor(private http: HttpClient, private localStorage: StorageManagerService) {
    // Load connection settings
    if (this.localStorage.getItem('server_ip') != null) {
      // Host address successfull loaded
      if (this.localStorage.getItem('server_port') != null) {
        // Server port successfull loaded
      } else {
        // Server port not available: Set default value
        this.localStorage.setItem('server_port', '3000');
      }
    } else {
      // Host address not available: Set default value
      this.localStorage.setItem('server_ip', 'localhost');
    }

    // Load usernamen and password
    if (this.localStorage.getItem('server_username') != null) {
      // Host address successfull loaded
      if (this.localStorage.getItem('server_password') != null) {
        // Server port successfull loaded
      } else {
        // Server port not available: Set default value
        this.localStorage.setItem('server_password', 'password');
      }
    } else {
      // Host address not available: Set default value
      this.localStorage.setItem('server_username', 'username');
    }
    this.createRequestBodyString();
    this.createServerConnectionString(); // Builds the final connection string: hostaddr+port+apiroutes
  }

  /**
   * GET - HTTP: Load accelerometer data from last box-punch
   * @returns Loaded accelerometer data
  */
  public getAccelerometerData(): Observable<any> {
    return this.http
      .get<any>(this.hostAddr + '/punchdata')
      .pipe(
        map(res => {
          return res;
        })
      );
  }

  /**
   * GET - HTTP: Load statistic data
   * @returns Loaded stats data
  */
  public getStatsData(): Observable<any> {
    return this.http
      .get<any>(this.hostAddr + '/recognitionstats', this.httpOptions)
      .pipe(
        map(res => {
          console.log('RecognitionLoaded in Service: ' + (res));
          return (res);
        })
      );
  }

  /**
   * POST - HTTP: Update statistic data
   * @param current statistics object
   * @returns new stats data
  */
  public updateStatsData(statsObj: any): Observable<any> {
    console.log('StatsModelCurrent only: ' + (statsObj));
    // tslint:disable-next-line:prefer-const
    let requestBody = this.generalRequestBodyObject;
    requestBody.statsData = statsObj;
    return this.http
      .post<any>(this.hostAddr + '/updatestats', requestBody, this.httpOptions)
      .pipe(
        map(res => {
          console.log('[service] ' + res);
          return (res);
        })
      );
  }

  /**
   * POST - HTTP: Delete statistic data
   * @returns result
  */
  public deleteStatsData(): Observable<any> {
    const requestBody = this.generalRequestBodyObject;
    return this.http
      .post<any>(this.hostAddr + '/deletestats', requestBody, this.httpOptions)
      .pipe(
        map(res => {
          console.log('[service]: ' + (res));
          return (JSON.parse(res));
        })
      );
  }

  /**
   * POST - HTTP: Check wheater the connection data is valid
   * @returns result of api connection
  */
  public getConnectionState(): Observable<any> {
    const requestBody = this.generalRequestBodyObject;
    return this.http
      .post<any>(this.hostAddr + '/apicheck', requestBody, this.httpOptions)
      .pipe(
        map(res => {
          const resu = JSON.parse(res);
          console.log('[service] ' + resu);
          return (resu);
        }),
        catchError((err) => {
          return new Observable<any>((observer: Observer<any>) => {
            observer.next(err);
            observer.complete();
          });
        })
      );
  }

  /**
   * Creates the server connection string in notation: host:port/api/routes
   * @returns void
  */
  public createServerConnectionString() {
    const host = this.localStorage.getItem('server_ip');
    const port = this.localStorage.getItem('server_port');
    this.hostAddr = host + ':' + port + '/api';
  }

  /**
   * Creates the basic request body as string
   * @returns void
  */
  public createRequestBodyString() {
    const user = this.localStorage.getItem('server_username');
    const pw = this.localStorage.getItem('server_password');
    this.generalRequestBodyObject = { 'username': user, 'password': pw, 'statsData': '' };
  }
}

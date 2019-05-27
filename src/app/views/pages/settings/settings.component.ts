import { StorageManagerService } from './../../../../services/storagemanager.service';
import { BackendconnectorService } from './../../../../services/backendconnector.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-settingsPage',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  constructor(private backendservice: BackendconnectorService, private localStorage: StorageManagerService) { }

  // #############################################
  // General Variables used in component
  // #############################################
  private connectionIntervalMS = 2000;            // Sets the reconnect duration
  private animationTimeInMS = 2000;               // Sets the animation duration
  public connected = false;                       // Stores the connection state
  public deletedStatsSuccessfull = false;
  public deletedStatsFailed = false;
  private reconnectInterval: any = null;          // Stores the timer-interval object
  public temp_port = 3000;                        // Stores the port of the current connection settings

  // #############################################
  // Variables for hard coded view texts (german)
  // #############################################
  public connectionState = 'Verbinde...';
  public statsDeleteTxt = 'Statistik löschen';
  public temp_ip: any = 'keine Daten hinterlegt...'; // Stores the host name of the current connection settings
  public temp_username: any = '';
  public temp_password: any = '';
  public connectionMessage = '';

  /**
   * EventHandler if component is initiated
   * @returns void
  */
  ngOnInit() {

    // Load settings from storage manager. If no data is present use default values
    if (this.localStorage.getItem('server_ip') === null) {
      this.localStorage.setItem('server_ip', 'localhost');
    }
    if (this.localStorage.getItem('server_port') === null) {
      this.localStorage.setItem('server_port', '3000');
    }

    if (this.localStorage.getItem('server_username') === null) {
      this.localStorage.setItem('server_username', 'username');
    }
    if (this.localStorage.getItem('server_password') === null) {
      this.localStorage.setItem('server_password', 'password');
    }

    this.temp_ip = this.localStorage.getItem('server_ip');    // Stores the server ip
    this.temp_port = Number.parseInt(this.localStorage.getItem('server_port'), 10); // Stores the server port
    this.temp_username = this.localStorage.getItem('server_username');
    this.temp_password = this.localStorage.getItem('server_password');

    this.checkBackendConnection();  // Checks if backend is available
  }

  /**
   * EventHandler if component is destroyed
   * @returns void
  */
  ngOnDestroy(): void {
    // Stop running interval timer
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
  }

  /**
   * OnClick handler if the button for deleting the statistics is clicked
   * @returns void
  */
  onStatisticDeleteClicked() {
    // Delete the statistics data on server side via backend service
    this.backendservice.deleteStatsData().subscribe(result => {
      // Data successfull deleted
      if (result.result) {
        // Start a little animation
        this.statsDeleteTxt = 'ERFOLGREICH!';
        this.deletedStatsSuccessfull = true;
        setTimeout(() => {
          this.deletedStatsSuccessfull = false;
          this.statsDeleteTxt = 'Statistik löschen';
        }, this.animationTimeInMS);
      } else {
        // Error while deleting data: also animated
        this.statsDeleteTxt = 'FEHLER!';
        this.deletedStatsSuccessfull = false;
        this.deletedStatsFailed = true;
        setTimeout(() => {
          this.deletedStatsFailed = false;
          this.statsDeleteTxt = 'Statistik löschen';
        }, this.animationTimeInMS);
      }
      console.log('[settings-comp] ' + result);
    });
  }

  /**
   * OnClick handler if the button for changing the connection data is clicked.
   * Updates the connection data
   * @returns void
  */
  onChangeBackendSettingsClicked() {
    // Make sure that the host address is valid
    if (!this.temp_ip.startsWith('http://')) {
      this.temp_ip = 'http://' + this.temp_ip;
    }

    // Store the changed data at the browsers localStorage
    this.localStorage.setItem('server_ip', this.temp_ip);
    this.localStorage.setItem('server_port', this.temp_port.toString());
    this.localStorage.setItem('server_username', this.temp_username);
    this.localStorage.setItem('server_password', this.temp_password);

    // Try to connect to backend using the new typed in data
    this.connected = false;
    this.connectionState = 'Verbinde...';
    this.backendservice.createRequestBodyString();
    this.backendservice.createServerConnectionString();
    this.checkBackendConnection();
  }

  /**
   * Tries to connect to the backend server via backend service.
   * Returns the connection state as boolean
   * @returns boolean
  */
  refreshConnection() {
    this.backendservice.getConnectionState().subscribe(result => {
      let returnResult = false;
      // If connected
      if (result.result) {
        this.connected = true;
        this.connectionState = 'Verbunden';
        this.connectionMessage = '';
        returnResult = true;
      } else {
        // If connection failed
        this.connected = false;
        this.connectionMessage = result.statusText;
        this.connectionState = 'Verbinde...';
      }
      console.log('refreshed connection: ' + JSON.stringify(result));
      return returnResult;
    });
  }

  /**
   * Sets a interval timer to cyclic check server connection
   * @returns void
  */
  checkBackendConnection() {
    // If interval timer not started and no connection is presend: Start connection timer
    if (!this.connected && this.reconnectInterval == null) {
      this.reconnectInterval = setInterval(() => {
        if (this.connected) {
          // If server connection established clear the timer
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
          console.log('stopped interval');
        } else {
          this.refreshConnection();
        }
      }, this.connectionIntervalMS);
    }
  }
}

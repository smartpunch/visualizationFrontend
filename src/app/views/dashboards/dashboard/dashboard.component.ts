import { Component, OnInit, OnDestroy } from '@angular/core';
import { BackendconnectorService } from '../../../../services/backendconnector.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // #############################################
  // General Variables used in component
  // #############################################
  public isAccDataAvailable = false;      // toggles the acc data line chart if no data is available
  private interval: any = null;           // stores the interval object for the acc-data refresh
  private factHand = -1;                  // stores the truth hand that users chose at rating-tab
  private factLabel = -1;                 // stores the truth label that users chose at rating-tab
  public readyForRating = false;          // toggles the rating-tab to rate the punch classification results
  public predLabel: number;               // predicted label in number notation (see docs for more)
  public predHand: number;                // predicted hand in number notation (see docs for more)
  public modal_Hand_to_show: string;      // hand text to show in rating modal
  public modal_Label_to_show: string;     // label text to show in rating modal
  private accRefreshIntervallMS = 2000;   // time in ms until reload accelerometer data
  public current_model_stats: any;        // stores the statistics-object

  // Variables for the charts
  public accelerometerDataChart = 'line'; // type definition for accelerometer chart view
  public modelStatsPieChart = 'pie';      // type definition for the pie chart to show the punch type ratio  

  // #############################################
  // Variables to handle the line-chart content
  // #############################################
  // Stores the accelerometer data for each axis of the last (current) punch
  public lastAcceleroData: Array<any> = [
    { data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], fill: false, label: 'X-Achse' },
    { data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], fill: false, label: 'Y-Achse' },
    { data: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], fill: false, label: 'Z-Achse' }
  ];
  // Stores the time stamps of the current punch
  public acceleroTimeStamps: Array<any> = [0, 100, 200, 300, 400, 500, 600]; // mocking data until real data is loaded


  // #############################################
  // Variables to handle the pie-chart content
  // #############################################
  // Stores the statistic values to display at the pie chart
  public modelStatsDatasets: Array<any> = [{
    data: [0, 0, 0, 0]
  }
  ];
  // Labels (classes) of the pie-chart content
  public modelStatsLabel: Array<any> = ['Frontal', 'Seitenhieb', 'Kinnhaken', 'Keine Aktion'];

  // #############################################
  // Variables for general chart definitions
  // #############################################
  // Defines the chart colors (not used)
  public chartColors: Array<any> = [];
  // Defines the style and feature settings of (all) charts
  public chartOptions: any = {
    responsive: true,
    elements: { point: { radius: 0 } },
    tooltips: {
      enabled: false
    },
    legend: {
      labels: {
        fontColor: '#5b5f62',
      }
    },
    scales: {
      display: false
    }
  };

  constructor(private backendservice: BackendconnectorService) { }

  ngOnInit() {
    // Load current statistic data
    this.loadStatsData();

    // Start updating accelerometer data each xxxx ms
    this.interval = setInterval(() => {
      this.updateAccData();
    }, this.accRefreshIntervallMS);
  }

  ngOnDestroy(): void {
    // Stop running interval timer
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  // #############################################
  // General methods
  // #############################################

  /**
   * Calls the backend service to load the statistics
   * data from backend server and updates:
   *  - the current_model_stats object
   *  - the pie chart content
   * @returns void
   */
  loadStatsData() {
    this.backendservice.getStatsData().subscribe(data => {
      if (data != null) {
        this.current_model_stats = JSON.parse(data);
        this.updatePieChart();
        console.log('[dash-comp] ' + this.current_model_stats);
      }
    });
  }

  /**
   * Calls the backend service to load the current accelerometer
   * data from backend server. If new data is available the following
   * updates are done:
   *  - the line chart content
   *  - all variables showing the prediction results
   * @returns void
   */
  updateAccData() {
    this.backendservice.getAccelerometerData().subscribe(data => {
      let buf: number;  // Stores temporary timestamp
      // tslint:disable-next-line:prefer-const
      let rawTimestamps = [];
      // tslint:disable-next-line:prefer-const
      let x_accelero_data = [];
      // tslint:disable-next-line:prefer-const
      let y_accelero_data = [];
      // tslint:disable-next-line:prefer-const
      let z_accelero_data = [];

      try {
        // Import all timestamps to the rawTimestamps array
        for (let i = 0; i < data[0].raws.length; i++) {
          if (i === 0) {
            rawTimestamps.push(parseInt(data[0].raws[i].timestamp, 10) / 1000000);
          } else {
            buf = rawTimestamps[i - 1] + (parseInt(data[0].raws[i].timestamp, 10) / 1000000);
            rawTimestamps.push(buf);
          }

          // Import all raw values to the x/y/z arrays
          x_accelero_data.push(data[0].raws[i].x);
          y_accelero_data.push(data[0].raws[i].y);
          z_accelero_data.push(data[0].raws[i].z);
        }

        // (Primitive) check if new data is available
        if ((this.lastAcceleroData[0].data[0] !== x_accelero_data[0]) &&
          (this.lastAcceleroData[1].data[0] !== y_accelero_data[0])) {

          // Update the data-content for the line chart
          this.update_acc_data(x_accelero_data, y_accelero_data, z_accelero_data, rawTimestamps);

          // Update prediction results and modal texts
          this.update_pred_results(data[1].predictedLabel, data[1].predictedHand);

          // Enable rating-tab
          this.readyForRating = true;
          this.isAccDataAvailable = true;
        }
      } catch (err) {
        this.isAccDataAvailable = false;
      }
    });
  }

  /**
   * Converts the label in number notation to the
   * corresponding text notation
   * @param lab predicted label in number-notation
   * @returns Predicted label in text-notation
   */
  convert_labelNumb_to_Text(lab: number): string {
    let result = '';
    switch (lab) {
      case 0:
        result = 'Keine Aktion';
        break;
      case 1:
        result = 'Kinnhaken';
        break;
      case 2:
        result = 'Seitenhieb';
        break;
      case 3:
        result = 'Frontalschlag';
        break;
      default:
        // tbd: Error message
        break;
    }
    return result;
  }

  /**
   * Converts the hand in number notation to the
   * corresponding text notation
   * @param hand predicted hand in number-notation
   * @returns Predicted hand in text-notation
   */
  convert_handNumb_to_Text(hand: number): string {
    let result = '';
    switch (hand) {
      case 0:
        result = 'Rechts';
        break;
      case 1:
        result = 'Links';
        break;
      default:
        // tbd: error message
        break;
    }
    return result;
  }

  /**
   * Converts the hand in text notation to the
   * corresponding number notation
   * @param hand predicted hand in string-notation
   * @returns Predicted hand in number-notation
   */
  convert_handText_to_Numb(hand: string): number {
    let result = -1;
    switch (hand) {
      case 'Rechts':
        result = 0;
        break;
      case 'Links':
        result = 1;
        break;
      default:
        // tbd: error message
        break;
    }
    return result;
  }

  /**
   * Converts the label in text notation to the
   * corresponding number notation
   * @param lab predicted label in text-notation
   * @returns Predicted hand in number-notation
   */
  convert_labelText_to_Numb(lab: string): number {
    let result = -1;
    switch (lab) {
      case 'Keine Aktion':
        result = 0;
        break;
      case 'Kinnhaken':
        result = 1;
        break;
      case 'Seitenhieb':
        result = 2;
        break;
      case 'Frontalschlag':
        result = 3;
        break;
      default:
        // tbd: error message
        break;
    }
    return result;
  }


  /**
   * OnClick handler if predicted results are incorrect:
   * If either hand OR label OR (hand AND label) classification failed the
   * statistics object gets updated and send to backend via backendservice
   * @returns void
  */
  on_save_corrected_prediction_results_clicked() {
    if (this.factHand > -1 || this.factLabel > -1) {
      // Find truth parameters
      const truthHand = this.factHand === -1 ? this.predHand : this.factHand;
      const truthLabel = this.factLabel === -1 ? this.predLabel : this.factLabel;

      // Check if the prediction was incorrect and if so update statistic object
      if (truthHand !== this.predHand || truthLabel !== this.predLabel) {
        // ------ UPDATE ABSOLUTE STAT-VALUES ------
        // Predicted hand was incorrect
        if (truthHand !== this.predHand) {
          this.current_model_stats.absoluteHandOnlyFailsSums[truthHand] += 1;
        } else {
          // Predicted hand was correct
          this.current_model_stats.absoluteHandOnlyWinsSums[truthHand] += 1;
        }

        // Predicted label was incorrect
        if (truthLabel !== this.predLabel) {
          this.current_model_stats.absolutePunchTypeOnlyFailsSums[truthLabel] += 1;
        } else {
          this.current_model_stats.absolutePunchTypeOnlyWinsSums[truthLabel] += 1;
        }

        // Update absolute negative accuracy value:
        this.current_model_stats.absoluteNegativeAccuracy += 1;

        // Update absolute fail wins sums:
        this.current_model_stats.absoluteFailWinSums[truthLabel].hands[truthHand][1] += 1;
        // ------ ABSOLUTE STAT-VALUES UPDATED ------

        // ------ UPDATE RELAVTIVE STAT-VALUES ------
        // Update relative accuracy
        const sum = this.current_model_stats.absolutePositiveAccuracy + this.current_model_stats.absoluteNegativeAccuracy;
        this.current_model_stats.relativeAccuracy = (100 / (sum)) * this.current_model_stats.absolutePositiveAccuracy;

        // Send updated stats to backend
        this.update_model_stats();
      } else {
        this.on_prediction_is_correct_clicked();
      }
    }
  }

  /**
   * OnClick handler if predicted results are correct:
   * If hand AND label classification failed the
   * statistics object gets updated and send to backend via backendservice
   * @returns void
  */
  on_prediction_is_correct_clicked() {
    this.current_model_stats.absolutePositiveAccuracy += 1;
    this.current_model_stats.absoluteHandOnlyWinsSums[this.predHand] += 1;
    this.current_model_stats.absolutePunchTypeOnlyWinsSums[this.predLabel] += 1;
    // Update absolute fail wins sums:
    this.current_model_stats.absoluteFailWinSums[this.predLabel].hands[this.predHand][0] += 1;
    // Update relative accuracy
    const sum = this.current_model_stats.absolutePositiveAccuracy + this.current_model_stats.absoluteNegativeAccuracy;
    this.current_model_stats.relativeAccuracy = (100 / (sum)) * this.current_model_stats.absolutePositiveAccuracy;

    // Send updated stats to backend
    this.update_model_stats();
  }

  /**
   * Event handler if the label-dropdown value changed
   * @param e Chosen label in number notation
   * @returns void
  */
  on_punchtype_corrected(e: number) {
    this.factLabel = e;
    this.modal_Label_to_show = this.convert_labelNumb_to_Text(e);
  }

  /**
   * Event handler if the hand-dropdown value changed
   * @param e Chosen hand in number notation
   * @returns void
  */
  on_punchHand_corrected(e: number) {
    this.factHand = e;
    this.modal_Hand_to_show = this.convert_handNumb_to_Text(e);
  }

  /**
   * OnClick handler the modal of the rating tab is closed via the 'x' button.
   * Resets all unsaved changes
   * @returns void
  */
  on_punch_facts_reset_clicked() {
    this.factHand = -1;
    this.factLabel = -1;
    this.modal_Hand_to_show = this.convert_handNumb_to_Text(this.predHand);
    this.modal_Label_to_show = this.convert_labelNumb_to_Text(this.predLabel);
  }

  /**
   * OnClick handler if the classification is correct for hand AND label.
   * Toggles the button if anything on the prediction results was changed
   * @returns boolean
  */
  isFullCorrect() {
    return (this.factHand === -1 && this.factLabel === -1);
  }

  /**
   * Updates the line-chart data for accelerometer data view   * 
   * @param x Array of numbers containing the x-axis accelerometer values
   * @param y Array of numbers containing the y-axis accelerometer values
   * @param z Array of numbers containing the z-axis accelerometer values
   * @param ts Array of the timestamps
   * @returns void
   */
  update_acc_data(x: any, y: any, z: any, ts: Array<any>) {
    this.lastAcceleroData[0].data = x;
    this.lastAcceleroData[1].data = y;
    this.lastAcceleroData[2].data = z;
    this.acceleroTimeStamps = ts;
  }

  /**
   * Updates prediction result and modal text(s)
   * @param predLab Predicted label in number notation but with data type string
   * @param predHand Predicted hand in number notation but with data type string
   * @returns void
   */
  update_pred_results(predLab: any, predHand: any) {
    this.predLabel = parseInt(predLab, 10);
    this.predHand = parseInt(predHand, 10);
    this.modal_Hand_to_show = this.convert_handNumb_to_Text(this.predHand);
    this.modal_Label_to_show = this.convert_labelNumb_to_Text(this.predLabel);
  }

  /**
   * Transfers the updated model statistics to the backend service to update
   * data on server. Also toggles the line-chart in 'waiting for data' mode and
   * updates the pie chart with the new model statistics data.
   * @returns void
  */
  update_model_stats() {
    // transfer new calculated stats to backend
    this.backendservice.updateStatsData(this.current_model_stats).subscribe(newStatsData => {
      if (newStatsData != null) {
        this.current_model_stats = JSON.parse(newStatsData);
        this.updatePieChart();
        console.log('[dash-comp] ' + this.current_model_stats);
      } else {
        console.log('updated and received: ' + newStatsData);
      }
    });
    // Toggle the line-chart in 'waiting for data' mode
    this.wait_for_next_punch();
  }

  /**
   * Updates the pie chart data
   * @returns void
  */
  updatePieChart() {
    // tslint:disable-next-line:max-line-length
    const frontalsCounter = Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyFailsSums[3], 10) + Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyWinsSums[3], 10);

    // tslint:disable-next-line:max-line-length
    const hooksCounter = Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyFailsSums[2], 10) + Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyWinsSums[2], 10);

    // tslint:disable-next-line:max-line-length
    const upperCutCounter = Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyFailsSums[1], 10) + Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyWinsSums[1], 10);

    // tslint:disable-next-line:max-line-length
    const noActionCounter = Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyFailsSums[0], 10) + Number.parseInt(this.current_model_stats.absolutePunchTypeOnlyWinsSums[0], 10);
    this.modelStatsDatasets = [{ data: [frontalsCounter, hooksCounter, upperCutCounter, noActionCounter] }];
  }

  /**
   * Sets the view components in 'waiting for data' mode
   * @returns void
  */
  wait_for_next_punch() {
    this.factHand = -1;
    this.factLabel = -1;
    this.readyForRating = false;
  }
}

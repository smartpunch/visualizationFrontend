import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent implements OnInit, OnChanges {

  constructor() { }

  // Value input for the absolute number of positive classifications
  @Input() valueAbsWins: number;

  // Value input for the absolute number of negative classifications
  @Input() valueAbsFails: number;

  // Relative values (in percent)
  public relWinPerc: number;
  public relFailPerc: number;

  /**
   * OnChange handler for new data input(s)
  */
  ngOnChanges() {
    const sum = this.valueAbsFails + this.valueAbsWins;
    this.relWinPerc = (100 / sum) * this.valueAbsWins;
    this.relFailPerc = (100 / sum) * this.valueAbsFails;
  }

  ngOnInit() {
  }

}

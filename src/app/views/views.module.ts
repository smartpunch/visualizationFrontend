import { AbsToRelInPercPipe } from './../../pipes/absToRelPipe.pipe';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../shared/shared.module';

import { FooterComponent } from '../main-layout/footer/footer.component';
import { StatsCardComponent } from './dashboards/common/stats-card/stats-card.component';
import { DashboardComponent } from './dashboards/dashboard/dashboard.component';
import { SettingsPageComponent } from './pages/settings/settings.component';
import { AboutPageComponent } from './pages/about/about.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  declarations: [
    FooterComponent,
    StatsCardComponent,
    DashboardComponent,
    SettingsPageComponent,
    AboutPageComponent,
    AbsToRelInPercPipe
  ],
  exports: [
    FooterComponent,
    StatsCardComponent,
    DashboardComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ViewsModule { }

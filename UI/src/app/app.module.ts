import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { HeaderComponent } from './header/header.component';
import { UploaderComponent } from './uploader/uploader.component'
import { RecordsComponent } from './records/records.component';
import { UserdetailsComponent } from './userdetails/userdetails.component'
import { MatSortModule } from '@angular/material/sort';
import { DuplicaterecordsComponent } from './duplicaterecords/duplicaterecords.component';
import { CompareComponent } from './compare/compare.component';
import { DatepipePipe } from './pipes/datepipe.pipe';

@NgModule({
  declarations: [
    AppComponent,
    GraphComponent,
    HeaderComponent,
    UploaderComponent,
    RecordsComponent,
    UserdetailsComponent,
    DuplicaterecordsComponent,
    CompareComponent,
    DatepipePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatTableModule,
    MatSidenavModule,
    MatIconModule,
    HttpClientModule,
    MatToolbarModule,
    MatTooltipModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

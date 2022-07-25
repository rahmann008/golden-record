import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { GraphComponent } from './graph/graph.component';
import { RecordsComponent } from './records/records.component';
import { UploaderComponent } from './uploader/uploader.component';

const routes: Routes = [  
{path: 'uploader', component: UploaderComponent},
{path: 'records', component: RecordsComponent},
{path:'app', component: AppComponent},
{path: 'graph', component: GraphComponent},
{path: '', redirectTo: 'uploader', pathMatch: "full"}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

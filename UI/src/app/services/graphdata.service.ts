import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GraphdataService {

  constructor(private http : HttpClient) { }
  graphsubject = new Subject<boolean>();
  updategraph = new Subject<any>();

  uploadAPI = 'http://127.0.0.1:8080//api/v1/golden_record'


  uploadFiles(file: any[]) : Observable<any>{
  
        const formData: any = new FormData();
        const files: Array<File> = file;
        
        for(let file of files){
          formData.append('file', file)
        }


        return this.http.post(this.uploadAPI, formData, {
          reportProgress: true,
        });
  }

}

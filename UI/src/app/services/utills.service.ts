import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as XLSX from "xlsx";

const getFileName = (name: any) => {
  let timeSpan = new Date().toISOString();
  let sheetName = name || "ExportResult";
  let fileName = `${sheetName}-${timeSpan}`;
  return {
    sheetName,
    fileName
  };
};

@Injectable({
  providedIn: 'root'
})
export class UtillsService {

  constructor() { }
 exportArrayToExcel(arr: any[], name?: string) {
    let { sheetName, fileName } = getFileName(name);

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }



  deletesubject = new Subject<any>();
  editedsubject = new Subject<any>();

}

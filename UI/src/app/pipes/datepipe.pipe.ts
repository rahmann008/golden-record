import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datepipe'
})
export class DatepipePipe implements PipeTransform {

  transform(value: any): string {
   return value.toString().replace(/(\d{4})(\d\d)(\d\d)/g, '$2/$3/$1');
  }

}

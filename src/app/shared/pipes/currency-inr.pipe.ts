import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyINR',
  standalone: true
})
export class CurrencyINRPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0';
    }
    return '₹' + Number(value).toLocaleString('en-IN');
  }
}


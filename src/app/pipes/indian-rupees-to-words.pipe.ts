import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianRupeesToWords',
  standalone: true,
})
export class IndianRupeesToWordsPipe implements PipeTransform {
  private static readonly ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  private static readonly tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  private static readonly scales = ['', 'Thousand', 'Lakh', 'Crore'];

  transform(value: number): string {
    if (isNaN(value) || value === null) return '';
    if (value === 0) return 'Zero Rupees';

    const rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);

    let result = this.convertWholeNumber(rupees) + ' Rupees' + ' Only';

    if (paise > 0) {
      result += ' and ' + this.convertWholeNumber(paise) + ' Paise' + ' Only';
    }

    return result;
  }

  private convertWholeNumber(num: number): string {
    if (num === 0) return '';
    if (num < 20) return IndianRupeesToWordsPipe.ones[num];

    let words = '';
    for (let i = 3; i >= 0; i--) {
      const divisor = Math.pow(10, 2 * i);
      if (num >= divisor) {
        let quotient = Math.floor(num / divisor);
        num %= divisor;
        if (quotient > 99) {
          words +=
            this.convertWholeNumber(Math.floor(quotient / 100)) + ' Hundred ';
          quotient %= 100;
        }
        if (quotient > 0) {
          if (words !== '') words += ' ';
          words += this.convertTwoDigits(quotient);
          words += ' ' + IndianRupeesToWordsPipe.scales[i];
        }
      }
    }
    return words.trim();
  }

  private convertTwoDigits(num: number): string {
    if (num < 20) return IndianRupeesToWordsPipe.ones[num];
    const tenner = Math.floor(num / 10);
    const rest = num % 10;
    return (
      IndianRupeesToWordsPipe.tens[tenner] +
      (rest !== 0 ? '-' + IndianRupeesToWordsPipe.ones[rest] : '')
    );
  }
}

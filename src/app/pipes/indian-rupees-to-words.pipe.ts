import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'indianRupeesToWords',
  standalone: true, // This makes the pipe standalone
})
export class IndianRupeesToWordsPipe implements PipeTransform {
  private units: string[] = [
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
  private tens: string[] = [
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
  private scales: string[] = ['', 'Thousand', 'Lakh', 'Crore'];

  transform(value: number): string {
    if (isNaN(value) || value === null) return '';
    if (value === 0) return 'Zero Rupees';

    const integerPart = Math.floor(value);
    const decimalPart = Math.round((value - integerPart) * 100); // Getting paise

    let wordString =
      this.convertNumberToWords(integerPart) + ' Rupees' + ' Only';

    if (decimalPart > 0) {
      wordString +=
        ` and ${this.convertNumberToWords(decimalPart)} Paise` + ' Only';
    }

    return wordString;
  }

  private convertNumberToWords(value: number): string {
    let result = '';
    let scaleIndex = 0;

    while (value > 0) {
      let chunk = value % 1000;

      if (chunk > 0) {
        let chunkInWords = this.convertChunkToWords(chunk);
        result = chunkInWords + ' ' + this.scales[scaleIndex] + ' ' + result;
      }

      value = Math.floor(value / 1000);
      scaleIndex++;
    }

    return result.trim();
  }

  private convertChunkToWords(chunk: number): string {
    let chunkStr = '';

    if (chunk > 99) {
      chunkStr += this.units[Math.floor(chunk / 100)] + ' Hundred ';
      chunk %= 100;
    }

    if (chunk > 19) {
      chunkStr += this.tens[Math.floor(chunk / 10)] + ' ';
      chunk %= 10;
    }

    if (chunk > 0) {
      chunkStr += this.units[chunk] + ' ';
    }

    return chunkStr.trim();
  }
}

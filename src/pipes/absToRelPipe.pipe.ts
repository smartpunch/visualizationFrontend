import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'absToRelInPercPipe' })
export class AbsToRelInPercPipe implements PipeTransform {

    /**
     * Converts a absolute number of values to gets shown as a percent/relative value
     * @param value Absolute value (to relate)
     * @param absPosValue   Absolute positive values
     * @param absNegativeValue Absolute negative values
     */
    transform(value: number, absPosValue: number, absNegativeValue: number): number {
        let result = 0;
        if (absPosValue + absNegativeValue > 0) {
            result = parseFloat((value * (100 / (absPosValue + absNegativeValue))).toFixed(0));
        }
        return result;
    }
}

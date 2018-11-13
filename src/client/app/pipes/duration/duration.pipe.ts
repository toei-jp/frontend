/**
 * DurationPipe
 */
import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'duration'
})
export class DurationPipe implements PipeTransform {

    /**
     * 変換
     * @method transform
     * @param {any} value
     * @param {string} format 単位
     */
    public transform(value: any, format: string): number {
        let result: number;
        switch (format) {
            case 'milliseconds':
                result = moment.duration(value).asMilliseconds();
                break;
            case 'seconds':
                result = moment.duration(value).asSeconds();
                break;
            case 'minutes':
                result = moment.duration(value).asMinutes();
                break;
            case 'hours':
                result = moment.duration(value).asHours();
                break;
            case 'days':
                result = moment.duration(value).asDays();
                break;
            case 'weeks':
                result = moment.duration(value).asWeeks();
                break;
            case 'months':
                result = moment.duration(value).asMonths();
                break;
            case 'years':
                result = moment.duration(value).asYears();
                break;
            default:
                result = moment.duration(value).asMilliseconds();
                break;
        }

        return result;
    }

}

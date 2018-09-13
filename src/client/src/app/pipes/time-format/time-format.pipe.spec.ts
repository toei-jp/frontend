/**
 * TimeFormatPipeテスト
 */
import * as moment from 'moment';
import { TimeFormatPipe } from './time-format.pipe';

describe('TimeFormatPipe', () => {
    it('transform', () => {
        const pipe = new TimeFormatPipe();
        expect(pipe).toBeTruthy();
        const result = pipe.transform(moment().toDate(), moment().format('YYYYMMDD'));
        expect(result).toEqual(moment().format('HH:mm'));
    });
});

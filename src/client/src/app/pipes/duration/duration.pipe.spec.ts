/**
 * DurationPipe
 */
import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  it('transform', () => {
    const pipe = new DurationPipe();
    expect(pipe).toBeTruthy();
    const duration = 'PT2H8M';
    expect(pipe.transform(duration, 'milliseconds')).toEqual(7680000);
    expect(pipe.transform(duration, 'seconds')).toEqual(7680);
    expect(pipe.transform(duration, 'minutes')).toEqual(128);
    expect(pipe.transform(duration, 'hours')).toEqual(2.1333333333333333);
    expect(pipe.transform(duration, 'days')).toEqual(0.08888888888888889);
    expect(pipe.transform(duration, 'weeks')).toEqual(0.012698412698412698);
    expect(pipe.transform(duration, 'months')).toEqual(0.0029204341407877417);
    expect(pipe.transform(duration, 'years')).toEqual(0.0002433695117323118);
  });
});

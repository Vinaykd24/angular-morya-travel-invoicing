import { IndianRupeesToWordsPipe } from './indian-rupees-to-words.pipe';

describe('IndianRupeesToWordsPipe', () => {
  it('create an instance', () => {
    const pipe = new IndianRupeesToWordsPipe();
    expect(pipe).toBeTruthy();
  });
});

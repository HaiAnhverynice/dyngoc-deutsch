import { createT } from './index';
import { en } from './en';
import { vi } from './vi';

describe('i18n', () => {
  it('has the same keys in both languages', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort());
  });

  it('interpolates and combines languages', () => {
    expect(createT('vi')('unit.day', { n: 3 })).toBe('3 ngày');
    expect(createT('en')('unit.day', { n: 3 })).toBe('3 d');
    expect(createT('both')('home.title')).toBe('Hôm nay / Today');
    expect(createT('both')('common.ok')).toBe('OK');
  });
});

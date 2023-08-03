import { Milliseconds } from '../constant/date.js';

const checkLessThanTime = (baseDate, seconds) => {
  const time = new Date().valueOf () - (seconds * Milliseconds);
  if (typeof baseDate === 'number' || typeof baseDate === 'string') {
    return new Date(baseDate).valueOf() > time;
  }

  return baseDate.valueOf() > time;
}

export { checkLessThanTime };
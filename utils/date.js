import { Milliseconds } from '../constant/date.js';

import { fillTimeTxt } from '../utils/string.js';

const checkLessThanTime = (baseDate, seconds) => {
  const time = new Date().valueOf () - (seconds * Milliseconds);
  if (typeof baseDate === 'number' || typeof baseDate === 'string') {
    return new Date(baseDate).valueOf() > time;
  }

  return baseDate.valueOf() > time;
}

const dateFormat = (date, format) => {
  if (date instanceof Date === false) {
    return date;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const _date = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const seconds = date.getSeconds();

  if (format.includes('YYYY')) {
    format = format.replace('YYYY', year);
  } else if (format.includes('YY')) {
    const strYear = year.toString();
    if (strYear.length >= 4) {
      format = format.replace('YY', strYear.slice(2));
    } else if (strYear.length >= 3) {
      format = format.replace('YY', strYear.slice(1));
    } else {
      format = format.replace('YY', strYear);
    }
  }

  if (format.includes('MM')) {
    format = format.replace('MM', fillTimeTxt(month));
  } else if (format.includes('M')) {
    format = format.replace('M', month);
  }


  if (format.includes('DD')) {
    format = format.replace('DD', fillTimeTxt(_date));
  } else if (format.includes('D')) {
    format = format.replace('D', _date);
  }

  if (format.includes('hh')) {
    format = format.replace('hh', fillTimeTxt(hour));
  } else if (format.includes('h')) {
    format = format.replace('h', hour);
  }

  if (format.includes('mm')) {
    format = format.replace('mm', fillTimeTxt(minute));
  } else if (format.includes('m')) {
    format = format.replace('m', minute);
  }

  if (format.includes('ss')) {
    format = format.replace('ss', fillTimeTxt(seconds));
  } else if (format.includes('s')) {
    format = format.replace('s', seconds);
  }

  return format;
}

export { checkLessThanTime, dateFormat };
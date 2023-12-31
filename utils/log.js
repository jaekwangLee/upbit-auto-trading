import {dateFormat} from './date.js';

export const dConsole = (...args) => {
	console.log(`[${dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')}]`);
	console.log(`[Log]`, ...args);
	console.log('\n================================================\n');
};

export const dConsoleWarn = (...args) => {
	console.log(`[${dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')}]`);
	console.warn('[Warn]', ...args);
	console.log('\n================================================\n');
};

export const dConsoleError = (...args) => {
	console.log(`[${dateFormat(new Date(), 'YYYY-MM-DD hh:mm:ss')}]`);
	console.error('[Error] ', ...args);
	console.log('\n================================================\n');
};

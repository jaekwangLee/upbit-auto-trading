import {dateFormat} from './date.js';

export class Logger {
	static MAX_LOGS = 100;

	static logs = [];

	static TYPE = {
		DEFAULT: 'DEFAULT',
		WARN: 'WARN',
		ERROR: 'ERROR',
	};

	static add(type, ...message) {
		if (this.logs.length > this.MAX_LOGS) {
			this.logs.shift();
		}

		const log = {
			TIME: this.timestamp(),
			MESSAGE: message,
		};

		if (type === Logger.TYPE.WARN) {
			console.warn(log);
		} else if (type === Logger.TYPE.ERROR) {
			console.error(log);
		} else {
			console.log(log);
		}

		this.logs.push({
			TIME: this.timestamp(),
			MESSAGE: message.join('\n'),
		});
	}

	static get() {
		const logs = [...this.logs].reverse();
		console.log(this.logs.length);
		return logs;
	}

	static clear() {
		this.logs = [];
	}

	static timestamp(format = 'YYYY-MM-DD hh:mm:ss') {
		return dateFormat(new Date(), format);
	}
}

export const dConsole = (...args) => {
	Logger.add(Logger.TYPE.DEFAULT, ...args);
};

export const dConsoleWarn = (...args) => {
	Logger.add(Logger.TYPE.WARN, ...args);
};

export const dConsoleError = (...args) => {
	Logger.add(Logger.TYPE.ERROR, ...args);
};

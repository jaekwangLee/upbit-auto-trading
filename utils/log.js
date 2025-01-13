import {postMessageAPI} from '../api/slack/message.js';
import {dateFormat} from './date.js';

export class Logger {
	static MAX_LOGS = 100;

	static logs = [];

	static TYPE = {
		DEFAULT: 'DEFAULT',
		WARN: 'WARN',
		ERROR: 'ERROR',
	};

	static PUSH_TYPE = {
		BUY: 'BUY',
		SELL: 'SELL',
		NICE_TRADE: 'NICE_TRADE',
		BAD_TRADE: 'BAD_TRADE',
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

	static push({type, message}) {
		console.log(message);

		const getChannel = (pushType) => {
			switch (pushType) {
				case Logger.PUSH_TYPE.BUY:
					return '매수_로그';
				case Logger.PUSH_TYPE.SELL:
					return '매도_로그';
				case Logger.PUSH_TYPE.NICE_TRADE:
				case Logger.PUSH_TYPE.BAD_TRADE:
					return '매매_수익률_로그';
			}
		};

		const getEmoji = (pushType) => {
			switch (pushType) {
				case Logger.PUSH_TYPE.BUY:
					return ':hear_no_evil:';
				case Logger.PUSH_TYPE.SELL:
					return ':see_no_evil:';
				case Logger.PUSH_TYPE.NICE_TRADE:
					return ':tada:';
				case Logger.PUSH_TYPE.BAD_TRADE:
					return ':sob:';
			}
		};

		const channel = getChannel(type);
		const emoji = getEmoji(type);
		void postMessageAPI({message, channel, emoji});
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

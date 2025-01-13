import {REST_API_METHOD} from '../../constant/network.js';
import {requestAPI, slackInstance} from '../instance.js';

const postMessageAPI = ({emoji, message, channel}) => {
	return requestAPI(slackInstance, '/chat.postMessage', REST_API_METHOD.POST, {
		data: {
			token: process.env['SLACK_PUSH_TOKEN'],
			icon_emoji: emoji,
			channel,
			text: message,
		},
	});
};

export {postMessageAPI};

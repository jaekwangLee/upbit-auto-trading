import {application} from 'express';
import {CONTENT_TYPE, REST_API_METHOD} from '../../constant/network.js';
import {requestAPI, slackInstance} from '../instance.js';

const postMessageAPI = ({emoji, message, channel, username}) => {
	return requestAPI(slackInstance, '/chat.postMessage', REST_API_METHOD.POST, {
		headers: {
			Authorization: `Bearer ${process.env['SLACK_PUSH_TOKEN']}`,
		},
		data: {
			token: process.env['SLACK_PUSH_TOKEN'],
			icon_emoji: emoji,
			channel,
			text: message,
			username,
		},
	});
};

export {postMessageAPI};

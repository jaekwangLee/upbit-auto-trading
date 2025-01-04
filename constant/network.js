const UPBIT_NETWORK_ERROR = Object.freeze({
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
});

const REST_API_METHOD = Object.freeze({
	POST: 'post',
	GET: 'get',
	DELETE: 'delete',
});

const CONTENT_TYPE = Object.freeze({
	APPLICATION_JSON: 'application/json',
	MULTIPART_FILE: 'multipart/form-data;',
	X_WWW_FORM_ENCODE: 'Application/x-www-form-urlencode ',
});

const PROMISE_STATE = Object.freeze({
	REJECTED: 'REJECTED',
	FULFILLED: 'FULFILLED',
	PENDING: 'PENDING',
});

export {UPBIT_NETWORK_ERROR, REST_API_METHOD, CONTENT_TYPE, PROMISE_STATE};

"use strict";

const request = require('request-promise');
const _ = require('underscore');

const requestOptionsForRoute = (path, token) => {
	return {
		url: `https://api.getmondo.co.uk${path}`,
		json: true,
		auth: {
			bearer: token
		}
	};
};

const getProfile = token => {
	const requestOptions = requestOptionsForRoute('/profile', token);
	return request(requestOptions);
};

const getAccounts = token => {
	const additionalRequestOptions = {
		transform2xxOnly: true,
		transform (body) {
			return body.accounts;
		}
	};
	const requestOptions = _.extend(requestOptionsForRoute('/accounts', token), additionalRequestOptions);

	return request(requestOptions);
};

const getBalance = (accountId, token) => {
	const additionalRequestOptions = {
		qs: { account_id: accountId }
	};

	const requestOptions = _.extend(requestOptionsForRoute('/balance', token), additionalRequestOptions);
	return request(requestOptions);
};

module.exports.getProfile = getProfile;
module.exports.getAccounts = getAccounts;
module.exports.getBalance = getBalance;
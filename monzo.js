"use strict";

const monzoApi = require(`./monzoApi`);

const utils = require(`./utils`);

const balance = token => {
	return monzoApi.getAccounts(token)
		.then(accounts => {
			const account = accounts[0];

			return monzoApi.getBalance(account.id, token);
		})
		.then(balance => utils.currencyToWords(balance.balance, balance.currency));
};

const spentToday = token => {
	return monzoApi.getAccounts(token)
		.then(accounts => {
			const account = accounts[0];

			return monzoApi.getBalance(account.id, token);
		})
		.then(balance => utils.currencyToWords(balance.spend_today * -1, balance.currency));
};

const name = token => {
	return monzoApi.getProfile(token)
		.then(profile => profile.name);
};

const composeAddress = profile => {
	let address = ``;
	profile.address.street_address.forEach((addressElement, i) => {
		if (i > 0) address = `${address}, `;
		address = `${address} ${addressElement}`;
	});
	address = `${address}, ${profile.address.locality}`;
	address = `${address}, ${profile.address.postal_code}`;

	return address;
};

const address = token => {
	return monzoApi.getProfile(token)
		.then(profile => composeAddress(profile));
};

const email = token => {
	return monzoApi.getProfile(token)
		.then(profile => profile.email);
};

const telephone = token => {
	return monzoApi.getProfile(token)
		.then(profile => profile.phone_number);
};

const dateOfBirth = token => {
	return monzoApi.getProfile(token)
		.then(profile => `<say-as interpret-as="date" format="ymd">${profile.date_of_birth}</say-as>`);
};

const userNumber = token => {
	return monzoApi.getProfile(token)
		.then(profile => profile.user_number);
};

module.exports.balance = balance;
module.exports.spentToday = spentToday;
module.exports.name = name;
module.exports.address = address;
module.exports.email = email;
module.exports.telephone = telephone;
module.exports.dateOfBirth = dateOfBirth;
module.exports.userNumber = userNumber;
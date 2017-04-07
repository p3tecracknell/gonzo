"use strict";

process.env.DEBUG = `actions-on-google:*`;

const ActionsSdkAssistant = require(`actions-on-google`).ActionsSdkAssistant;

const monzo = require(`./monzo`);

const noInputResponses = [
	`Say a command to get an answer`,
	`If you're stuck, just say help`,
	`If you're done then just say goodbye!`
];

const intentionMatch = (assistant, argName) => {
	console.log(JSON.stringify(assistant.getTopInput_()));

	const processedText = (assistant.getArgument(argName) || ``).toLocaleLowerCase();

	console.log(processedText);

	const token = assistant.getUser().access_token;

	switch (processedText)
	{
		case ``:
			return monzo.balance(token)
				.then(balance => ask(assistant, `Hello. Your balance is ${balance}. Just say help to find out what else I can do`));
		case `help`:
			return ask(assistant, `Try asking what's my balance or how much have I spent today. Alternatively, say more help to find out what else I can do`);
		case `more help`:
			return ask(assistant, `You can also check your profile. Find out how by saying help with my profile`);
		case `help with my profile`:
			return ask(assistant, `Try saying what's my name or email or address or telephone or date of birth`);
	}

	if (processedText.includes(`balance`)) return monzo.balance(token)
		.then(balance => tell(assistant, `Your balance is ${balance}`));
	if (processedText.includes(`spent today`)) return monzo.spentToday(token)
		.then(spentToday => tell(assistant, `You've spent ${spentToday} today`));
	if (processedText.includes(`name`)) return monzo.name(token)
		.then(name => tell(assistant, `Your name is ${name}`));
	if (processedText.includes(`email`)) return monzo.email(token)
		.then(email => tell(assistant, `Your email is ${email}`));
	if (processedText.includes(`address`)) return monzo.address(token)
		.then(address => tell(assistant, `Your address is ${address}`));
	if (processedText.includes(`phone`)) return monzo.telephone(token)
		.then(telephone => tell(assistant, `Your telephone is ${telephone}`));
	if (processedText.includes(`birth`)) return monzo.dateOfBirth(token)
		.then(dateOfBirth => tell(assistant, `Your date of birth is ${dateOfBirth}`));
	if (processedText.includes(`user number`)) return monzo.userNumber(token)
		.then(userNumber => tell(assistant, `Your user number is ${userNumber}`));

	return ask(assistant, `I heard ${processedText} but I did not recognise what you said. Either repeat it or just say help`);
};

const ask = (assistant, text) => {
	const samlText = buildSsml(text);

	console.log(samlText);

	const inputPrompt = assistant.buildInputPrompt(true, samlText, noInputResponses);
	assistant.ask(inputPrompt);
};

const tell = (assistant, text) => {
	const samlText = buildSsml(text);

	console.log(samlText);

	assistant.tell(samlText);
};

const buildSsml = text => {
	return `<speak>${text}</speak>`;
};

exports.process = (req, res) => {
	const assistant = new ActionsSdkAssistant({request: req, response: res});

	let actionMap = new Map();
	actionMap.set(assistant.StandardIntents.MAIN, assistant => intentionMatch(assistant, `trigger_query`));

	actionMap.set(assistant.StandardIntents.TEXT, assistant => intentionMatch(assistant, `text`));

	assistant.handleRequest(actionMap);
};
/*
	LiveDisplay works by setting all four rows of the screen at once, so you can
	essentially create pages of metrics to show at once.

	The examples below include a world clock page, and a currency conversion page,
	and some static text. A commented-out example of weather is also included,
	though an API key is required to run it (see getCurrentWeather in livedisplay.js).

	To add a new page, simply add another call to addPage( content ) with an
	array of metric objects. If your array has more than 4 elements, every element
	beyond the fourth will be ignored.

	You can provide as few as 1 element, in which case the rows below will be
	blank whilst that page is active.

	Each metric object follows the template:
	{
		'metric': function (callback, ...), // a function that calls callback with the value to display
		'icon': string, 		// optional, a url to use for the metric icon
		'arguments': [],		// optional, any arguments to send to the metric function
		'prepend': string, 		// optional, any text to add before the metric value
		'append': string, 		// optional, any text to add after the metric value
	}

	Built-in metric functions can be found in livedisplay.js, and include:
	- getRobloxVisitsAndConcurrents 	[ number|string: universeId, boolean|null: getVisits ]
	- getRobloxFavouritesCount 			[ number|string: universeId ]
	- getRobloxGroupMembers				[ number|string: groupId ]
	- getDiscordPresenceCount			[ string: guildId ]
	- getYouTubeSubscribersAndViews 	[ string: channelName, boolean|null: getSubscribers ]
	- getTwitterFollowers 				[ string: screenName ]
	- getInstagramFollowers 			[ string: username ]
	- getTimeAndDate 					[ string: area, string: location, boolean|null: omitTimezone, boolean|null: omitDayIndicator ]
	- getCurrencyConversion 			[ string: currencyA, string: currencyB, number|null: multiplier, number|null: decimalPlaces ]
	- getCurrentWeather 				[ string: apiKey, string: location, string: country, string|array: type ]

	If you make a change, and want to see it instantly, you may need to run localStorage.clear()
	in your browser's console to clear cached values. Some of the APIs used have rate limits,
	so if you refresh this way too often, you may see a limit.
*/

// Add pages

// World clock example
addPage([
	{ // UK time
		'metric': getTimeAndDate,
		'icon': './img/uk.svg',
		'arguments': ['Europe', 'London'],
	},
	{ // NY time
		'metric': getTimeAndDate,
		'icon': './img/us.svg',
		'arguments': ['America', 'New_York'],
	},
	{ // LA time
		'metric': getTimeAndDate,
		'icon': './img/us.svg',
		'arguments': ['America', 'Los_Angeles'],
	},
	{ // JP time
		'metric': getTimeAndDate,
		'icon': './img/jp.svg',
		'arguments': ['Asia', 'Tokyo'],
	},
]);

// Currency example
addPage([
	{ // GBP per USD
		'metric': getCurrencyConversion,
		'icon': './img/usd.svg',
		'arguments': ['USD', 'GBP'],
		'prepend': '$',
		'append': ' = £1.00',
	},
	{ // GBP per 1000 Robux
		'metric': getCurrencyConversion,
		'icon': './img/robux.svg',
		'arguments': ['GBP', 'Robux', 1000],
		'prepend': '£',
		'append': ' = 1000',
	},
	{ // Robux per GBP
		'metric': getCurrencyConversion,
		'icon': './img/robux.svg',
		'arguments': ['Robux', 'GBP'],
		'append': ' = £1.00',
	},
]);

// Static text example
addPage([
	{
		'metric': function (callback) { callback('BanTechRBLX'); },
		'icon': './img/bts.svg',
	},
	{
		'metric': function (callback) { callback('Follow Me'); },
		'icon': './img/social.svg',
	},
]);

// Weather example
addPage([
	{ // London temperature
		'icon': 'WEATHER',
		'metric': getCurrentWeather,
		'arguments': ['YOUR_API_KEY', 'London', 'GB', 'temperature'],
	},
	{ // London wind speed and direction
		'icon': './img/wind.svg',
		'metric': getCurrentWeather,
		'arguments': ['YOUR_API_KEY', 'London', 'GB', 'wind'],
	},
	{ // London sunrise / sunset
		'icon': './img/sunset.svg',
		'metric': getCurrentWeather,
		'arguments': ['YOUR_API_KEY', 'London', 'GB', ['sunrise', 'sunset']],
	},
]);

// MAIN FUNCTIONALITY BELOW

$(document).ready(function () {
	initialiseScreens();
});
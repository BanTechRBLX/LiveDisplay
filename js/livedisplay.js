// Metric functions
function getRobloxVisitsAndConcurrents(callback, universeId, getVisits) {
	// Gets the numbers of visits and currently-playing users for the given
	// universe ID.

	// If getVisits is provided, the total number of visits is given.
	// Otherwise, the number of current concurrent players is given.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://cors-anywhere.herokuapp.com/https://games.roblox.com/v1/games?universeIds=' + universeId.toString(), {
		dataType: 'json',
		success: function (data) {
			if (getVisits) {
				callback(localiseNumber(data.data[0].visits));
			} else {
				callback(localiseNumber(data.data[0].playing));
			}
		},
	});
}

function getRobloxFavouritesCount(callback, universeId) {
	// Gets the number of favourites on a Roblox game with the given universe ID.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://cors-anywhere.herokuapp.com/https://games.roblox.com/v1/games/' + universeId.toString() + '/favorites/count', {
		dataType: 'json',
		success: function (data) {
			callback(localiseNumber(data.favoritesCount));
		},
	});
}

function getRobloxGroupMembers(callback, groupId) {
	// Gets the number of members in a Roblox group with the given group ID.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://cors-anywhere.herokuapp.com/https://groups.roblox.com/v1/groups/' + groupId.toString(), {
		dataType: 'json',
		success: function (data) {
			callback(localiseNumber(data.memberCount));
		},
	});
}

function getDiscordPresenceCount(callback, guildId) {
	// Gets the current presence count (online users) for the given
	// Discord guild ID.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://cors-anywhere.herokuapp.com/https://discordapp.com/api/guilds/' + guildId.toString() + '/widget.json', {
		dataType: 'json',
		success: function (data) {
			callback(localiseNumber(data.presence_count));
		},
	});
}

function getYouTubeSubscribersAndViews(callback, channelName, getSubscribers) {
	// Gets the YouTube subscriber or view count for the given channelName.

	// If getSubscribers is provided, the subscriber count is given.
	// Otherwise, the view count is given.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://cors-anywhere.herokuapp.com/https://www.youtube.com/c/' + channelName + '/about', {
		dataType: 'html',
		success: function (data) {
			if (getSubscribers) {
				let subCount = 0;
				let subString = data.match(/"([\d,\.KM]+)\ssubscribers"/)[1];
				let thousands = subString.match(/K/);
				let millions = subString.match(/M/);
				if (thousands)
					subCount = parseFloat(subString) * Math.pow(10, 3);
				if (millions)
					subCount = parseFloat(subString) * Math.pow(10, 6);
				callback(localiseNumber(subCount));
			} else {
				callback(localiseNumber(parseInt(data.match(/"([\d,]+)\sviews"/)[1].replace(',', ''))));
			}
		},
	});
}

function getTwitterFollowers(callback, screenName) {
	// Gets the Twitter follower count for the given username.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://cors-anywhere.herokuapp.com/https://cdn.syndication.twimg.com/widgets/followbutton/info.json?screen_names=' + screenName, {
		dataType: 'json',
		success: function (data) {
			callback(localiseNumber(data[0].followers_count));
		},
	});
}

function getInstagramFollowers(callback, username) {
	// Gets the Instagram follower count for the given username.

	if (typeof (callback) != 'function')
		error('Callback required.');

	$.ajax('https://www.instagram.com/' + username, {
		dataType: 'html',
		success: function (data) {
			callback(localiseNumber(parseInt(data.match(/"edge_followed_by":{"count":(\d+)}/)[1])));
		},
	});
}

function getTimeAndDate(callback, area, location, omitTimezone, omitDayIndicator) {
	// Gets the time and timezone of a given area and location.

	// A list of valid area/location combinations can be found
	// at https://worldtimeapi.org/timezones

	// If omitTimezone is provided, the timezone abbreviation
	// won't be added to the metric value.

	// If omitDayIndicator is provided, the day difference
	// won't be added (tmw = tomorrow, yda = yesterday).

	if (typeof (callback) != 'function')
		error('Callback required.');

	if (typeof (area) != 'string' || typeof (location) != 'string')
		return callback('invalid');
	
	function getTimeFromCache() {
		let data = timezoneCache[area][location]
		let localDate = new Date();
		let remoteDate = new Date(localDate.getTime() + data.raw_offset * 1000);
		let timeString = ('00' + remoteDate.getHours().toString()).substr(-2) + ':' + ('00' + remoteDate.getMinutes().toString()).substr(-2);
		if (!omitDayIndicator) {
			if (remoteDate.getDate() - localDate.getDate() == 1)
				timeString += ' tmw';
			else if (remoteDate.getDate() - localDate.getDate() == -1)
				timeString += ' yda';
		}
		callback(timeString + (omitTimezone ? '' : (' ' + data.abbreviation)));
	}
	
	if (!timezoneCache || !timezoneCache[area] || !timezoneCache[area][location])
		$.ajax('https://cors-anywhere.herokuapp.com/https://worldtimeapi.org/api/timezone/' + area + '/' + location, {
			dataType: 'json',
			success: function (data) {
				if (!timezoneCache)
					timezoneCache = {};
				if (!timezoneCache[area])
					timezoneCache[area] = {};
				if (!timezoneCache[area][location])
					timezoneCache[area][location] = {};
				
				timezoneCache[area][location] = {
					'abbreviation': data.abbreviation,
					'raw_offset': data.raw_offset,
				};
				getTimeFromCache();
			},
		});
	else
		getTimeFromCache();
}

function getCurrencyConversion(callback, currencyA, currencyB, multiplier, decimalPlaces) {
	// Gets how much of currencyA is in 1 unit of currencyB.

	// currencyA or currencyB can be Robux.
	// Assumes a DevEx rate of 350 USD per 100K Robux.

	// If multiplier is supplied, the output is multiplied before formatting,
	// for example getCurrencyConversion(callback, 'GBP', 'USD', 1000) would
	// return 1000 USD in GBP (around 770 GBP whilst writing this).

	// If decimalPlaces is supplied, the resulting value will be rounded to
	// the provided number of decimal places. This is ignored for Robux results.

	if (typeof (callback) != 'function')
		error('Callback required.');

	if (typeof (currencyA) != 'string' || typeof (currencyB) != 'string')
		return callback('invalid');
	if (typeof (multiplier) != 'number')
		multiplier = 1;
	if (currencyA == currencyB)
		return callback(formatMoneyNumber(multiplier, decimalPlaces));

	$.ajax('https://cors-anywhere.herokuapp.com/https://api.exchangeratesapi.io/latest', {
		dataType: 'json',
		success: function (data) {
			if (currencyB == 'Robux')
				callback(formatMoneyNumber(multiplier * (data.rates[currencyA] / data.rates.USD) * 0.0035, decimalPlaces));
			else if (currencyA == 'Robux')
				callback(Math.floor(multiplier * data.rates.USD / (data.rates[currencyB] * 0.0035)));
			else
				callback(formatMoneyNumber(multiplier * data.rates[currencyA] / data.rates[currencyB]), decimalPlaces);
		},
	});
}

function extractWeatherType(type) {
	// Sub function for weather.
	if (type == 'temperature')
		return weatherCache.temp + '°C';
	else if (type == 'pressure')
		return weatherCache.pres + ' mb'
	else if (type == 'sunrise')
		return weatherCache.sunrise;
	else if (type == 'sunset')
		return weatherCache.sunset;
	else if (type == 'wind')
		return weatherCache.wind_spd + ' m/s, ' + weatherCache.wind_dir + '°';
}

function createWeatherString(type) {
	// Sub function for weather.
	if (typeof (type) == 'string')
		type = [type];
	let weatherString = '';
	for (let index = 0; index < type.length; index++) {
		const element = type[index];
		if (weatherString.length > 0)
			weatherString += ' / ';
		weatherString += extractWeatherType(element);
	}
	return weatherString;
}

function getCurrentWeather(callback, apiKey, location, country, type) {
	// Gets the weather in the specified location and country.

	// apiKey is required. Register at https://www.weatherbit.io/

	// location and country are required. The list of valid cities and countries
	// can be found here: https://www.weatherbit.io/api/meta

	// type is required. It can either be a string for a single type, or if provided
	// an array of strings, each corresponding value will be concatenated with slashes.
	// Valid types are below (feel free to add more by editing createWeatherString):
	//   'temperature' 	- returns temperature in degrees Celsius
	//   'pressure' 	- returns pressure in millibar
	//   'sunrise'		- returns sunrise time in local timezone
	//   'sunset'		- returns sunset time in local timezone
	//   'wind'			- returns wind speed and direction

	if (typeof (callback) != 'function')
		error('Callback required.');

	if (typeof (apiKey) != 'string')
		error('Weather API key required.');
	if (typeof (location) != 'string' || typeof (country) != 'string')
		callback('invalid');
	if (typeof (type) != 'string' && typeof (type) != 'object')
		callback('invalid');

	if (Date.now() - lastWeatherFetch > 1800000) {
		$.ajax('https://cors-anywhere.herokuapp.com/https://api.weatherbit.io/v2.0/current?city=' + location + '&country=' + country + '&key=' + apiKey, {
			dataType: 'json',
			success: function (data) {
				let windSpd = data.data[0].wind_spd;
				if (windSpd < 10) {
					windSpd = windSpd.toFixed(2);
				} else {
					windSpd = windSpd.toFixed(1);
				}
				weatherCache = {
					'wind_spd': windSpd,
					'wind_dir': data.data[0].wind_dir,
					'temp': data.data[0].temp,
					'sunrise': data.data[0].sunrise,
					'sunset': data.data[0].sunset,
					'pres': data.data[0].pres,
					'icon': data.data[0].weather.icon,
				};
				lastWeatherFetch = Date.now();
				callback(createWeatherString(type));
			},
		});
	} else {
		callback(createWeatherString(type));
	}
}

// MAIN FUNCTIONALITY BELOW

const rows = 7;
const characters = {
	'0': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'1': [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'2': [1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1],
	'3': [1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'4': [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'5': [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
	'6': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
	'7': [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'8': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'9': [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'a': [0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1],
	'b': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1],
	'c': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
	'd': [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'e': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1],
	'f': [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0],
	'g': [0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1],
	'h': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
	'i': [1, 0, 1, 1, 1, 1, 1],
	'j': [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1],
	'k': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1],
	'l': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1],
	'm': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
	'n': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
	'o': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
	'p': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0],
	'q': [0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
	'r': [0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
	's': [0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1],
	't': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
	'u': [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1],
	'v': [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0],
	'w': [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0],
	'x': [0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1],
	'y': [0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1],
	'z': [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1],
	'A': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'B': [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'C': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
	'D': [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'E': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
	'F': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
	'G': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
	'H': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'I': [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
	'J': [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'K': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
	'L': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
	'M': [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'N': [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
	'O': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'P': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
	'Q': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
	'R': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1],
	'S': [1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1],
	'T': [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
	'U': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'V': [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0],
	'W': [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
	'X': [1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1],
	'Y': [1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
	'Z': [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
	'.': [0, 0, 0, 0, 0, 0, 1],
	'!': [1, 1, 1, 1, 1, 0, 1],
	'?': [1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0],
	':': [0, 0, 0, 1, 0, 1, 0],
	';': [0, 0, 0, 1, 0, 1, 1],
	'-': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
	'+': [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0],
	'=': [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
	',': [0, 0, 0, 0, 0, 1, 1],
	' ': [0, 0, 0, 0, 0, 0, 0],
	'$': [0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0],
	'£': [0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
	'%': [1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1],
	'(': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
	'[': [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
	'{': [0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
	')': [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	']': [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
	'}': [1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
	'/': [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
	'#': [0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0],
	'°': [1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
};
const transitionWidth = 12;
const transitionFill = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
const transitionClear = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
const transitionStepDelay = 30;

var columns = 72; // changes on window resize
var timeout = 10; // secs, default
var quickChange = false; // skip the wipe transition (for devices that can't handle animations and fast changes)

var content = [];
var contentIndex = -1;
var lastTransitionTime = 0;

var weatherCache = null;
var lastWeatherFetch = 0;
var timezoneCache = null;

var contentCache = localStorage.getItem('contentCache');
if (contentCache)
	contentCache = JSON.parse(contentCache);
if (!contentCache)
	contentCache = [];

// Create string function for a given pixel container
function drawCharacter(character, pixelMap) {
	let charPixels = characters[character];
	if (!charPixels)
		charPixels = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

	charPixels.forEach(activate => {
		pixelMap.push(activate);
	});
}

function getWeatherIcon() {
	if (!weatherCache || typeof (weatherCache) != 'object' || !weatherCache.icon)
		return './img/cloud.svg';
	return './img/weather/' + weatherCache.icon + '.png';
}

function transitionScreen($container, pixelMap, icon) {
	if (pixelMap.length == 0 && $container.find('.pixel.on').length == 0)
		return;

	$container.data('transition', true);
	if (icon == 'WEATHER')
		icon = getWeatherIcon();
	$container.parent().find('.metric-icon .icon').css('background-image', 'url(' + icon + ')');

	if (quickChange) {
		$container.find('.pixel').each(function (index, element) {
			if (element.classList.contains('on'))
				element.classList.remove('on');
		});
		setTimeout(function () {
			$container.find('.pixel').each(function (index, element) {
				if (element.classList.contains('on') && pixelMap[index] != 1)
					element.classList.remove('on');
				else if (!element.classList.contains('on') && pixelMap[index] == 1)
					element.classList.add('on');
			});
			$container.data('transition', false);
		}, 1000);
	} else {
		let startingPixelIndex = -transitionWidth * rows;
		let numPixels = $container.find('.pixel').length;
		let iterations = columns + transitionWidth;
		let iterationIndex = 0;
		let iterate = function () {
			setTimeout(function () {
				if (quickChange) // Exit early
					return transitionScreen($container, pixelMap, icon);
				
				startingPixelIndex += rows;
				for (let pixelIndex = startingPixelIndex; pixelIndex < startingPixelIndex + transitionWidth * rows; pixelIndex++) {
					if (pixelIndex < 0 || pixelIndex >= numPixels)
						continue;
					let transition = transitionFill[pixelIndex - startingPixelIndex];
					if (transition == 1) {
						$container.find('.pixel:eq(' + pixelIndex + ')').addClass('on');
					} else {
						let clear = transitionClear[pixelIndex - startingPixelIndex];
						if (clear != 1)
							continue;
						let activate = pixelMap[pixelIndex];
						if (activate == 1)
							$container.find('.pixel:eq(' + pixelIndex + ')').addClass('on');
						else
							$container.find('.pixel:eq(' + pixelIndex + ')').removeClass('on');
					}
				}

				iterationIndex++;
				if (iterationIndex < iterations)
					iterate();
				else
					$container.data('transition', false);
			}, transitionStepDelay);
		}
		iterate();
	}
}

function setMessage($container, message, icon) {
	if ($container.data('transition'))
		return setTimeout(function () { setMessage($container, message, icon); }, 500);

	let pixelMap = [];
	let blankColumn = [0, 0, 0, 0, 0, 0, 0];
	let charArray = message.split('');
	charArray.forEach(character => {
		drawCharacter(character, pixelMap);
		pixelMap = pixelMap.concat(blankColumn);
	});
	transitionScreen($container, pixelMap, icon);
}

function toggleSettings() {
	let $settings = $('.settings');
	$settings.toggleClass('open');
	$('.settings-toggle').toggleClass('open', $settings.hasClass('open'));
}

function toggleTheme() {
	let $html = $('html');
	$html.toggleClass('invert');
	localStorage.setItem('theme', $html.hasClass('invert') ? 'invert' : null);
}

function updateTimeout(object) {
	timeout = object.value;
	$('input#timeout').val(timeout);
	$('input#timeout_range').val(timeout);
	localStorage.setItem('timeout', timeout);
}

function toggleQuickChange() {
	quickChange = !quickChange;
	$('button#quick_change').text(quickChange ? 'Use Transitions' : 'Use Quick Changes');
	localStorage.setItem('quickChange', quickChange);
}

// Create pixels
function createPixels($containers) {
	$containers.each(function (index, container) {
		let $existingPixels = $(container).find('.pixel');
		if ($existingPixels.length > columns * rows) {
			for (let index = columns * rows; index < $existingPixels.length; index++) {
				$($existingPixels[index]).remove();
			}
		}
		for (let index = 0; index < columns * rows; index++) {
			if ($existingPixels[index])
				continue;
			let element = document.createElement('div');
			container.appendChild(element);
			let $element = $(element);
			$element.addClass('pixel');
		}
	});
}

// Formatting
function localiseNumber(number) {
	// Helper function to format numbers to local format (e.g. commas betwen thousands).
	if (typeof (number) != 'number')
		return number;
	return number.toLocaleString();
}

function formatMoneyNumber(number, decimalPlaces) {
	// Helper function to format money to either 2 decimal places or the provided number of places.
	if (typeof (number) != 'number')
		return number;
	if (typeof (decimalPlaces) != 'number')
		decimalPlaces = null;
	return Math.floor(number).toLocaleString() + (number % 1).toFixed(decimalPlaces ? decimalPlaces : 2).substring(1);
}

// Cyclic handling
function iterateScreen() {
	if (content.length < 1)
		return;
	contentIndex = (contentIndex + 1) % content.length;
	$('.pixel-container').each(function (index, container) {
		let $container = $(container);
		if (content[contentIndex][index]) {
			if (!contentCache[contentIndex])
				contentCache[contentIndex] = [];
			if (!contentCache[contentIndex][index] || Date.now() >= contentCache[contentIndex][index].timeout) {
				content[contentIndex][index].metric(function (value) {
					let prepend = content[contentIndex][index].prepend;
					let append = content[contentIndex][index].append;
					setMessage($container, (prepend ? prepend : '') + value + (append ? append : ''), content[contentIndex][index].icon);

					// Cache the request's response
					contentCache[contentIndex][index] = {
						'timeout': Date.now() + (content[contentIndex][index].metric.name == 'getTimeAndDate' ? 60000 : 600000), // 10 mins (or 1 min for clock)
						'value': value,
					}
					localStorage.setItem('contentCache', JSON.stringify(contentCache));

					lastTransitionTime = Date.now() + (quickChange ? (columns + transitionWidth) * transitionStepDelay : 0);
				}, ...content[contentIndex][index].arguments);
			} else {
				let value = contentCache[contentIndex][index].value;
				let prepend = content[contentIndex][index].prepend;
				let append = content[contentIndex][index].append;
				setMessage($container, (prepend ? prepend : '') + value + (append ? append : ''), content[contentIndex][index].icon);
			}
		} else {
			setMessage($container, '', './img/placeholder.svg');
		}
	});

}

function initialiseScreens() {
	let checkFunction = function () {
		let nowTime = Date.now();
		if (document.visibilityState == 'visible' && nowTime - lastTransitionTime > timeout * 1000) { // 20 secs
			iterateScreen();
			lastTransitionTime = nowTime + (quickChange ? (columns + transitionWidth) * transitionStepDelay : 0);
		}
	};
	setInterval(checkFunction, 200)
	checkFunction();
}

function addPage(contentArray) {
	if (typeof (contentArray) != 'object')
		error('Content must be an array.');
	if (contentArray.length < 1)
		error('Content must be an array.');
	
	for (let index = 0; index < contentArray.length; index++) {
		const element = contentArray[index];
		if (typeof (element) != 'object')
			error('Page metric must be an object.');
		if (typeof (element.metric) != 'function')
			error('Metric function required.');
		if (typeof (element.icon) != 'string')
			element.icon = '';
		if (typeof (element.arguments) != 'object' || element.arguments.length < 1)
			element.arguments = [];
		if (typeof (element.prepend) != 'string')
			element.prepend = '';
		if (typeof (element.append) != 'string')
			element.append = '';
	}
	content.push(contentArray.slice(0, $('.pixel-container').length));
}

function nextPage() {
	if (Date.now() > lastTransitionTime)
		iterateScreen();
}

function setUpScreen() {
	let w = window.innerWidth;
	let h = window.innerHeight;

	let spaceRemaining = w - 16.5 * (h * 0.02222);
	columns = Math.floor(spaceRemaining / (h * 0.02222));

	// Create all the pixels based on container
	createPixels($('.pixel-container'));
}

var resizeId;
$(window).resize(function () {
	clearTimeout(resizeId);
	id = setTimeout(setUpScreen, 1000);
});
setUpScreen();

// Initialise some things
if (localStorage.getItem('theme') == 'invert')
	$('html').addClass('invert');

timeout = localStorage.getItem('timeout') ? parseInt(localStorage.getItem('timeout')) : timeout;
$('#timeout_range,#timeout').val(timeout);
quickChange = typeof (!!localStorage.getItem('quickChange')) == 'boolean' ? localStorage.getItem('quickChange') : quickChange;
$('button#quick_change').text(quickChange ? 'Use Transitions' : 'Use Quick Changes');
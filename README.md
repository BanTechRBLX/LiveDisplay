# LiveDisplay
Live Demo: https://bantechrblx.github.io/LiveDisplay

This web application is inspired by the [LaMetric Time connected clock](https://lametric.com/), which allows you to show all sorts of metrics using apps or custom [IFTTT](https://ifttt.com/) programs.

I decided a LaMetric Time was too expensive just to show some counters, so I picked up a cheap used tablet on eBay and set about making this. There are some improvements, such as being easy to set up and modify, and shows 4 rows at once with more characters. However, I haven't been bothered to set it up to be easily compatible with IFTTT - instead I just made my own built-in functions for a lot of the metrics I personally care about.

You are welcome to make pull requests and suggestions with more metrics you'd like on it.

## Installation on a Web Server

To install the app on your own server you'll need a server that runs [Apache](https://httpd.apache.org/). All the paths in `pwa.js` should work fine both in a web root or in a sub directory.

You can see an example of what it should function like when installed here: https://bantechrblx.github.io/LiveDisplay

Note how you are given the option to install it on your device upon visiting the website - this allows the website to run in full screen and force landscape mode on mobile devices - extremely useful for when I wanted to run it on the tablet I acquired. It's also neat to have an icon on the home screen to open it directly, and a nice splash screen as it's loading. It's called a [progressive web app](https://web.dev/progressive-web-apps/) in case you wanted to learn how to make your own.

## Installation Locally (on your PC)

You can also run it locally on your PC by downloading the contents of the repository into a folder. Simply open `index.html` in Chrome or another modern browser.

The [PWA](https://web.dev/progressive-web-apps/) part won't work locally, but that's not too big of an issue as you can just make the window fullscreen on a PC without any issue. To be able to access your site from another device, and install it onto a mobile device, it will need to be hosted on a web server.

## Usage

Setting up the pages to display whatever you want is explained in the `main.js` file, with the built-in functions located in `livedisplay.js`.

The examples included in the demo code are a world clock page, a currency conversion page, and some static text. A commented-out example of weather is also included, though an API key is required to run it (see getCurrentWeather in livedisplay.js).

To add pages, you add calls to `addPage( content )` with an array of metric objects. If your array has more than 4 elements, every element beyond the fourth will be ignored.

You can provide as few as 1 element, in which case the remaining rows will be blank whilst that page is active.

Each metric object follows the template:
```js
{
  "metric": function (callback, ...), // a function that calls callback with the value to display
  "icon": 'string', 		      // optional, a url to use for the metric icon
  "arguments": [],		      // optional, any arguments to send to the metric function, passed via ...
  "prepend": 'string', 		      // optional, any text to add before the metric value
  "append": 'string', 		      // optional, any text to add after the metric value
}
```

Built-in metric functions include:
```
- getRobloxVisitsAndConcurrents 	[ universeId, getVisits ]
- getRobloxFavouritesCount 		[ universeId ]
- getRobloxGroupMembers			[ groupId ]
- getDiscordPresenceCount		[ guildId ]
- getYouTubeSubscribersAndViews 	[ channelName, getSubscribers ]
- getTwitterFollowers 			[ screenName ]
- getInstagramFollowers 		[ username ]
- getTimeAndDate 			[ area, location, omitTimezone, omitDayIndicator ]
- getCurrencyConversion 		[ currencyA, currencyB, multiplier, decimalPlaces ]
- getCurrentWeather 			[ apiKey, location, country, type ]
```
The type of each parameter is documented in `main.js`, along with the example code used at https://bantechrblx.github.io/LiveDisplay.

window.addEventListener('beforeinstallprompt', (event) => {
	// Stash the event so it can be triggered later.
	window.deferredPrompt = event;
	// Remove the 'hidden' class from the install button container
	$('.install-button').removeClass('hidden');
});

$('.install-button').click(function () {
	const promptEvent = window.deferredPrompt;
	if (!promptEvent) {
		// The deferred prompt isn't available.
		return;
	}
	// Show the install prompt.
	promptEvent.prompt();
	// Log the result
	promptEvent.userChoice.then((result) => {
		// Reset the deferred prompt variable, since
		// prompt() can only be called once.
		window.deferredPrompt = null;
		// Hide the install button.
		$('.install-button').addClass('hidden');
	});
});

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register('./sw.js').then(function (registration) {
			// Registration was successful
			console.log('ServiceWorker registration successful with scope: ', registration.scope);
		}, function (err) {
			// Registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		});
	});
}
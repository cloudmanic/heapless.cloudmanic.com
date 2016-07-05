//
// Convert a mysql timestamp.
//
app.filter('dateToISO', function() {
	return function(input) {
		input = new Date(input).toISOString();
		return input;
	};
});
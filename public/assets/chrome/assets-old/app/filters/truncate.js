//
// Truncate a string.
//
app.filter('truncate', [function () {
	return function (text, length, end) {
		if(isNaN(length))
		{
			length = 10;
		}
		
		if(end === undefined)
		{
			end = "...";
		}
		
		if(text === undefined)
		{
			return '';
		}

		if(text.length <= length || text.length - end.length <= length) 
		{
			return text;
		} else 
		{
			return String(text).substring(0, length-end.length) + end;
		}
	}
}]);
var rest = {}

//
// Send a POST.
//
rest.post = function (url, data, callback)
{
  try {
		var xhr = new XMLHttpRequest();
		
		xhr.open('POST', url, false);		
		
		xhr.setRequestHeader('Content-Type', 'application/json');
		
		xhr.send(JSON.stringify(data));
		
		callback(JSON.parse(xhr.response));
  } catch(e) {
		console.log('XHR Error ' + e.toString());
  }	
}
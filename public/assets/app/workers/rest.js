var rest = {}

//
// Send a GET.
//
rest.get = function (url)
{
  try {
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', url, false);
		
		xhr.send();
		
		return JSON.parse(xhr.response);
  } catch(e) {
		console.log('XHR Error ' + e.toString());
		return false;
  }	
}

//
// Send a POST.
//
rest.post = function (url, data)
{
  try {
		var xhr = new XMLHttpRequest();
		
		xhr.open('POST', url, false);		
		
		xhr.setRequestHeader('Content-Type', 'application/json');
		
		xhr.send(JSON.stringify(data));
		
		return JSON.parse(xhr.response);
  } catch(e) {
		console.log('XHR Error ' + e.toString());
		return false;
  }	
}
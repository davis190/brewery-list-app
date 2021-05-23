const https = require('https');

exports.handler = (event, context, callback) => {
	var random_num = Math.floor(Math.random() * 999999999)
	const req = https.get("https://www.brewersassociation.org/wp-content/themes/ba2019/json-store/breweries/breweries.json?nocache="+random_num, function(res) {
	res.on('data', chunk => {
		dataString += chunk;
	});
	res.on('end', () => {
		console.log(dataString);
		dataString['ResultData'].forEach(function(brewery) {
			console.log(brewery)
		})
	});
	});

	req.on('error', (e) => {
		console.log("ERROR:")
		console.error(e);
	});
}
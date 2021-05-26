var https = require('https');
var AWS			 = require('aws-sdk')
var dynamodb = new AWS.DynamoDB();
var ssm = new AWS.SSM({apiVersion: '2014-11-06'});

var STATE_ABBREVIATION= {
    "California": "CA",
    "Colorado": "CO",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kentucky": "KY",
    "Minnesota": "MN",
    "Michigan": "MI",
    "Missouri": "MO",
    "Nebraska": "NE",
    "Nevada": "NV",
    "North Carolina": "NC",
    "Ohio": "OH",
    "Texas": "TX",
    "Washington": "WA",
    "Wisconsin": "WI"
}

exports.brewers_association_handler = (event, context, callback) => {
	var random_num = Math.floor(Math.random() * 999999999)
	var FETCH_URL = "https://www.brewersassociation.org/wp-content/themes/ba2019/json-store/breweries/breweries.json?nocache="+random_num
	console.log(FETCH_URL)
	var US_STATE_FILTERS = ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'];

	https.get(FETCH_URL, function(res) {
		// console.log(res)
		console.log("Got response: " + res.statusCode);
		// context.succeed();
		var body = [];
		res.on('data', function(chunk) {
			body.push(chunk);
		});
		res.on('end', function() {
			try {
				body = JSON.parse(Buffer.concat(body).toString());
				var json_body = JSON.parse(body)
				console.log(json_body['ResultData'])
				// var keys = Object.keys(json_body);
				// console.log(keys)
				json_body['ResultData'].forEach(function(brewery) {
					if (brewery['Zip'] != "" && brewery['StateProvince'] != "" && US_STATE_FILTERS.includes(brewery['StateProvince']) && brewery['Type'] != "Planning" && brewery['Type'] != "Contract") {
						console.log("-------")
						// console.log(brewery['Country'] + " - " + brewery['StateProvince'])
						console.log(brewery)
						var params = {
								Item: {
									"brewery_id": {
										S: brewery['BreweryDBID']
									}, 
									"state_abr": {
										S: brewery['StateProvince']
									}, 
									"brewery_name": {
										S: brewery['InstituteName']
									},
									"address": {
										S: brewery['Address1']
									},
									"city": {
										S: brewery['City']
									},
									"zip": {
										S: brewery['Zip']
									},
									"lat": {
										S: brewery['Latitude']
									},
									"lon": {
										S: brewery['Longitude']
									},
									"type": {
										S: brewery['BreweryType']
									}
								}, 
								TableName: process.env.DYNAMODB_TABLE
							};
							dynamodb.putItem(params, function(err, data) {
								if (err) console.log(err, err.stack); // an error occurred
								else	 console.log(data);		   // successful response
								
							});
					}
				})
			} catch(e) {
				console.log("ERROR")
				console.error(e);
			}
			// console.log(body);
		});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
			context.done(null, 'FAILURE');
		});
}

exports.google_sheets_handler = (event, context, callback) => {
	var params = {
		Name: '/brewery-app/api-key',
		WithDecryption: true
	};
	ssm.getParameter(params, function(err, API_KEY) {
		if (err) console.log(err, err.stack); // an error occurred
		else {
			var params = {
				Name: '/brewery-app/sheet-id',
				WithDecryption: true
			};
			ssm.getParameter(params, function(err, SHEET_ID) {
				if (err) console.log(err, err.stack); // an error occurred
				else {
					var FETCH_URL = "https://sheets.googleapis.com/v4/spreadsheets/"+SHEET_ID+"/values/USA\!A2:P100?key="+API_KEY+"&majorDimension=COLUMNS"
					console.log(FETCH_URL)

					https.get(FETCH_URL, function(data) {
						data['values'].forEach(function(row) {
							var state = row[0].split("(")[0].trim();
							var state_abr = STATE_ABBREVIATION[state]

							for (var r = 1; r < row.length; r++) {
								var params = {
									Item: {
										"state_abr": {
											S: state_abr
										}, 
										"brewery_name": {
											S: row[r]
										}
									}, 
									TableName: process.env.DYNAMODB_TABLE
								};
								dynamodb.putItem(params, function(err, data) {
									if (err) console.log(err, err.stack); // an error occurred
									else	 console.log(data);		   // successful response
									
								});
							}
						})
					})
				}
			});
		}
	});
}
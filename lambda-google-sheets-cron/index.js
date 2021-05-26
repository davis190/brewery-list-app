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

exports.handler = (event, context, callback) => {
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
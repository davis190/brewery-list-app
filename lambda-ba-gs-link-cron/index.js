var https = require('https');
var AWS			 = require('aws-sdk')
var dynamodb = new AWS.DynamoDB();

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
		TableName: process.env.GS_DYNAMODB_TABLE
	};
	dynamodb.scan(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else {
			console.log(data);
			var cleaned_data = []
			data['Items'].forEach(function(data_item) {
				cleaned_data.push(AWS.DynamoDB.Converter.unmarshall(data_item))
			})
			cleaned_data.forEach(function(visited_brewery) {
				if (visited_brewery['brewery_id']) {

				} else {
					
				}
			})
		}
	});
}
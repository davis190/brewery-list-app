var https = require('https');
var AWS			 = require('aws-sdk')
var dynamodb = new AWS.DynamoDB();

// change
var STATE_ABBREVIATION= {
    "Alabama": "AL",
    "Alaska": "AK",
	"Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
	"Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
	"Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
	"Nebraska": "NE",
	"Nevada": "NV",
	"New Hampshire": "NH",
	"New Jersey": "NJ",
	"New Mexico": "NM",
	"New York": "NY",
	"North Carolina": "NC",
	"North Dakota": "ND",
	"Ohio": "OH",
	"Oklahoma": "OK",
	"Oregon": "OR",
	"Pennsylvania": "PA",
	"Rhode Island": "RI",
	"South Carolina": "SC",
	"South Dakota": "SD",
	"Tennessee": "TN",
	"Texas": "TX",
	"Utah": "UT",
	"Vermont": "VT",
	"Virginia": "VA",
	"Washington": "WA",
	"West Virginia": "WV",
	"Wisconsin": "WI",
	"Wyoming": "WY"
}

exports.handler = (event, context, callback) => {
	var updated_date_date = new Date()
	var updated_date = updated_date_date.toString()
	var params = {
		TableName: process.env.GS_DYNAMODB_TABLE
	};
	dynamodb.scan(params, function(err, gs_brewery_data) {
		if (err) console.log(err, err.stack); // an error occurred
		else {
			console.log(gs_brewery_data);
			var cleaned_data = []
			gs_brewery_data['Items'].forEach(function(data_item) {
				cleaned_data.push(AWS.DynamoDB.Converter.unmarshall(data_item))
			})
			cleaned_data.forEach(function(visited_brewery) {
				console.log("Visited Brewery")
				console.log(visited_brewery)
				if (visited_brewery['brewery_id']) {
					// Get brewery by ID
					var params = {
						ExpressionAttributeValues: {
							":brewery_id": {
								S: visited_brewery['brewery_id']
							}
						}, 
						ExpressionAttributeNames: {
							"#brewery_id" : "brewery_id"
						},
						KeyConditionExpression: "#brewery_id = :brewery_id", 
						IndexName: "brewery-id-index",
						TableName: process.env.BA_DYNAMODB_TABLE
					};
					dynamodb.query(params, function(err, ba_brewery_data) {
						if (err) {
							console.log(err, err.stack);
						} else {
							// console.log(ba_brewery_data);
							var cleaned_breweries = []
							ba_brewery_data['Items'].forEach(function(dynamo_brewery) {
								cleaned_breweries.push(AWS.DynamoDB.Converter.unmarshall(dynamo_brewery))
							})
							console.log(cleaned_breweries)

							// Push changes to GS Dynamo
							delete ba_brewery_data['Items']['brewery_name']
							var params = {
								ExpressionAttributeNames: {
									"#s": "state", 
									"#a": "address",
									"#c": "city",
									"#z": "zip",
									"#la": "lat",
									"#lo": "lon",
									"#t": "type",
									"#ud": "updated_date",
									"#status": "status"
								}, 
								ExpressionAttributeValues: {
									":s": {
										S: cleaned_breweries[0]['state']
									}, 
									":a": {
										S: cleaned_breweries[0]['address']
									},
									":c": {
										S: cleaned_breweries[0]['city']
									},
									":z": {
										S: cleaned_breweries[0]['zip']
									},
									":la": {
										S: cleaned_breweries[0]['lat']
									},
									":lo": {
										S: cleaned_breweries[0]['lon']
									},
									":t": {
										S: cleaned_breweries[0]['type']
									},
									":ud": {
										S: updated_date
									},
									":status": {
										S: "match_found"
									}
								}, 
								Key: {
									"brewery_name": {
										S: visited_brewery['brewery_name']
									}
								}, 
								ReturnValues: "ALL_NEW", 
								TableName: process.env.GS_DYNAMODB_TABLE, 
								UpdateExpression: "SET #s = :s, #a = :a, #c = :c, #z = :z, #la = :la, #lo = :lo, #t = :t, #ud = :ud, #status = :status"
							};
							dynamodb.updateItem(params, function(err, data) {
								if (err) console.log(err, err.stack); // an error occurred
								else {
									// console.log(data);		   // successful response
								}
							});

							// Update BA DynamoDB
							var params = {
								ExpressionAttributeNames: {
									"#ud": "updated_date",
									"#status": "status"
								}, 
								ExpressionAttributeValues: {
									":ud": {
										S: updated_date
									},
									":status": {
										S: "match_found"
									}
								}, 
								Key: {
									"brewery_id": {
										S: visited_brewery['brewery_id']
									}
								}, 
								ReturnValues: "ALL_NEW", 
								TableName: process.env.BA_DYNAMODB_TABLE, 
								UpdateExpression: "SET #ud = :ud, #status = :status"
							};
							console.log(params)
							dynamodb.updateItem(params, function(err, data) {
								if (err) console.log(err, err.stack); // an error occurred
								else {
									// console.log(data);		   // successful response
								}
								
							});
						}
					});
				} else {
					var names_to_try = [
						visited_brewery['brewery_name'].trim(),
						visited_brewery['brewery_name'],
						visited_brewery['brewery_name']+" LLC",
						visited_brewery['brewery_name']+", LLC",
					]
					if (visited_brewery['brewery_name'].includes("Company")) {
						names_to_try.push(visited_brewery['brewery_name'].replace("Company", "Co"))
						names_to_try.push(visited_brewery['brewery_name'].replace("Company", "Co."))
					} else if (visited_brewery['brewery_name'].includes("Co")) {
						names_to_try.push(visited_brewery['brewery_name'].replace("Co", "Company"))
						names_to_try.push(visited_brewery['brewery_name'].replace("Co", "Co."))
					} 
					console.log("## SEARCHING BY NAME")
					console.log(names_to_try)
					names_to_try.forEach(function(brewery_name_to_try) {
						// console.log("Trying: "+brewery_name_to_try)
						var params = {
							ExpressionAttributeValues: {
								":brewery_name": {
									S: brewery_name_to_try
								}
							}, 
							ExpressionAttributeNames: {
								"#brewery_name" : "brewery_name"
							},
							KeyConditionExpression: "#brewery_name = :brewery_name", 
							IndexName: "brewery-name-index",
							TableName: process.env.BA_DYNAMODB_TABLE
						};
						dynamodb.query(params, function(err, ba_brewery_search) {
							if (err) {
								console.log(err, err.stack);
							} else {
								if (ba_brewery_search['Items'].length != 0) {
									console.log("## MATCH FOUND")
									console.log(ba_brewery_search);
									var cleaned_ba_brewery_search = []
									ba_brewery_search['Items'].forEach(function(dynamo_ba_brewery_search) {
										cleaned_ba_brewery_search.push(AWS.DynamoDB.Converter.unmarshall(dynamo_ba_brewery_search))
									})
									console.log(cleaned_ba_brewery_search)

									// Update GS DynamoDB
									var params = {
										ExpressionAttributeNames: {
											"#s": "state", 
											"#a": "address",
											"#c": "city",
											"#z": "zip",
											"#la": "lat",
											"#lo": "lon",
											"#t": "type",
											"#ud": "updated_date",
											"#status": "status",
											"#ban": "ba_name"
										}, 
										ExpressionAttributeValues: {
											":s": {
												S: cleaned_ba_brewery_search[0]['state']
											}, 
											":a": {
												S: cleaned_ba_brewery_search[0]['address']
											},
											":c": {
												S: cleaned_ba_brewery_search[0]['city']
											},
											":z": {
												S: cleaned_ba_brewery_search[0]['zip']
											},
											":la": {
												S: cleaned_ba_brewery_search[0]['lat']
											},
											":lo": {
												S: cleaned_ba_brewery_search[0]['lon']
											},
											":t": {
												S: cleaned_ba_brewery_search[0]['type']
											},
											":ud": {
												S: updated_date
											},
											":status": {
												S: "match_found"
											},
											":ban": {
												S: cleaned_ba_brewery_search[0]['brewery_name']
											}
										}, 
										Key: {
											"brewery_name": {
												S: visited_brewery['brewery_name']
											}
										}, 
										ReturnValues: "ALL_NEW", 
										TableName: process.env.GS_DYNAMODB_TABLE, 
										UpdateExpression: "SET #s = :s, #a = :a, #c = :c, #z = :z, #la = :la, #lo = :lo, #t = :t, #ud = :ud, #status = :status, #ban = :ban"
									};
									dynamodb.updateItem(params, function(err, data) {
										if (err) console.log(err, err.stack); // an error occurred
										else {
											// console.log(data);		   // successful response
										}
									});

									// Update BA DynamoDB
									var params = {
										ExpressionAttributeNames: {
											"#ud": "updated_date",
											"#status": "status"
										}, 
										ExpressionAttributeValues: {
											":ud": {
												S: updated_date
											},
											":status": {
												S: "match_found"
											}
										}, 
										Key: {
											"brewery_id": {
												S: cleaned_ba_brewery_search[0]['brewery_id']
											}
										}, 
										ReturnValues: "ALL_NEW", 
										TableName: process.env.BA_DYNAMODB_TABLE, 
										UpdateExpression: "SET #ud = :ud, #status = :status"
									};
									console.log(params)
									dynamodb.updateItem(params, function(err, data) {
										if (err) console.log(err, err.stack); // an error occurred
										else {
											// console.log(data);		   // successful response
										}
									});
								}
								
							}
						})
					})
				}
			})
		}
	});
}
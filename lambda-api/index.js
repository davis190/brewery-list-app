var AWS			 = require('aws-sdk')
var dynamodb = new AWS.DynamoDB();

exports.handler = (event, context, callback) => {
	console.log(event)

	if (event['httpMethod'] == "GET") {
		if (event['resource'] == "/brewery/state/{state}" || event['resource'] == "/brewery/state/{state}/count") {
			console.log("HERE")
			console.log(event['pathParameters']['state'])
			getBreweriesFromState(event['pathParameters']['state'].toUpperCase()).then(function(breweries) {
				if (event['resource'] == "/brewery/state/{state}") {
					response(null, breweries['Items'], callback)
				} else {
					response(null, breweries['Count'], callback)
				}
			})
			// response(null, "MADE IR", callback)
		}
	}
}

function getBreweriesFromState(state_abr) {
	return new Promise ( ( resolve, reject ) => {
		var params = {
			ExpressionAttributeValues: {
				":state_abr": {
					S: state_abr
				}
			}, 
			KeyConditionExpression: "state_abr = :state_abr", 
			TableName: process.env.DYNAMODB_TABLE
		};
		dynamodb.query(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				console.log(data);
				resolve(data)
			}
			/*
			data = {
			ConsumedCapacity: {
			}, 
			Count: 2, 
			Items: [
				{
			"SongTitle": {
				S: "Call Me Today"
				}
			}
			], 
			ScannedCount: 2
			}
			*/
		});
	})
}

function response(err, res, callback) {
    console.log("API Response")
    if (err) {
        console.log(err)
    }
    // mysql.end()
    callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? JSON.stringify(err) : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            // 'Access-Control-Allow-Origin': 'https://app.workerscan.com',
            'Access-Control-Allow-Origin': '*',
            // 'Access-Control-Allow-Headers': 'Authorization',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        }
    });
}
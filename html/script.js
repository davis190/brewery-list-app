
STATE_ABBREVIATION= {
    "California": "CA",
    "Colorado": "CO",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Minnesota": "MN",
    "Michigan": "MI",
    "Missouri": "MO",
    "Nebraska": "NE",
    "North Carolina": "NC",
    "Washington": "WA",
    "Wisconsin": "WI"
}
function getStateBreweries(state, stateVisitedTotal, fullBreweryArray, inBusinessBreweryArray) {
    console.log(state)

    var random_num = Math.floor(Math.random() * 999999999)
    $.ajax({
        url: "https://breweryapi.claytondavis.dev/api/brewery/state/"+STATE_ABBREVIATION[state]+"/count",
        async: false,
        method: "GET",
        // data: "action=get_breweries&_id="+state+"&search_by=statename"
    })
    .done(function( data ) {
        console.log(data)
        var breweryCount = data
        console.log("Google Sheet Breweries: "+stateVisitedTotal)
        console.log("Total Breweries: "+breweryCount)

        var statusbarnum = Math.round((stateVisitedTotal / breweryCount) * 100)

        // Add the state title + empty progress bar
        $( "#list" ).append('<div class="stateTitle" onclick="$(\'#breweryList'+STATE_ABBREVIATION[state]+'\').toggle()">'+state+' '+statusbarnum+'% ('+stateVisitedTotal+'/'+breweryCount+')</div><div class="progressbar" id="progressBar'+STATE_ABBREVIATION[state]+'"></div>')

        // Add list of visited breweries
        var breweryList = ""
        $.each(fullBreweryArray, function( index, brewery) {
            var style = ""
            // If brewery is in the google sheets ignore array - color it red, but still display it
            if (!inBusinessBreweryArray.includes(brewery)) {
                style='style="color:red"'
            }
            breweryList = breweryList + '<div class="brewery" '+style+'>'+brewery+'</div>'
        })
        $( "#list" ).append('<div class="breweryList" id="breweryList'+STATE_ABBREVIATION[state]+'">'+breweryList+'</div>')

        // populate progress bar with percentage
        $( "#progressBar"+STATE_ABBREVIATION[state] ).progressbar({value: statusbarnum});
    });
}

function getSheetBreweries() {
    

    $.ajax({
        url: "https://sheets.googleapis.com/v4/spreadsheets/"+SHEET_ID+"/values/USA\!A2:L60?key="+API_KEY+"&majorDimension=COLUMNS"
    })
    .done(function( data ) {
        for (var i = 0, placeArray; placeArray = data['values'][i]; i++) {
            var fullBreweryArray = []
            var inBusinessBreweryArray = []

            var state = placeArray[0].split("(")[0].trim();
            // console.log("state - "+state)
            for (var r = 1, place; place = placeArray[r]; r++) {
                // fullBreweryArray - is the array of all of the breweries
                fullBreweryArray.push(place)
                // Create inBusinessBreweryArray - for only breweries not in the ignore list - this is for the count
                if (!gsIgnoreList[STATE_ABBREVIATION[state]].includes(place)) {
                    inBusinessBreweryArray.push(place)
                }
            }
            var breweryTotal = inBusinessBreweryArray.length;
            getStateBreweries(state, breweryTotal, fullBreweryArray, inBusinessBreweryArray)
        }
        $("#loading").hide()
        $("#info").show()
    });
    
}

getSheetBreweries()
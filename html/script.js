
STATE_ABBREVIATION= {
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

function getStateBreweries(state, stateVisitedTotal, fullBreweryArray, inBusinessBreweryArray, unvisitedArray, ignoredCount, couldNotFindArray) {
    console.log("getStateBreweries for "+state)

    var random_num = Math.floor(Math.random() * 999999999)
    $.ajax({
        url: "https://breweryapi.claytondavis.dev/api/brewery/state/"+STATE_ABBREVIATION[state]+"/count",
        async: false,
        method: "GET",
    })
    .done(function( breaeryapi_count_data ) {
        var breweryCount = breaeryapi_count_data
        console.log("Subtracting ignored count: "+ignoredCount)
        breweryCount = breweryCount - ignoredCount
        console.log("Google Sheet Breweries: "+stateVisitedTotal)
        console.log("Total Breweries: "+breweryCount)

        var statusbarnum = Math.round((stateVisitedTotal / breweryCount) * 100)

        // Add the state title + empty progress bar
        $( "#list" ).append('<div class="stateTitle" onclick="$(\'#breweryList'+STATE_ABBREVIATION[state]+'\').toggle()">'+state+' '+statusbarnum+'% ('+stateVisitedTotal+'/'+breweryCount+')</div><div class="progressbar" id="progressBar'+STATE_ABBREVIATION[state]+'"></div>')
        $( "#list" ).append('<center><button class="ui-button ui-widget ui-corner-all" \
            onclick="$(\'#visited'+STATE_ABBREVIATION[state]+'\').show(); \
                $(\'#unvisited'+STATE_ABBREVIATION[state]+'\').show();"> \
            Show All \
        </button> \
        <button class="ui-button ui-widget ui-corner-all" \
            onclick="$(\'#visited'+STATE_ABBREVIATION[state]+'\').show(); \
                $(\'#unvisited'+STATE_ABBREVIATION[state]+'\').hide();"> \
            See visited breweries \
        </button> \
        <button class="ui-button ui-widget ui-corner-all" \
            onclick="$(\'#visited'+STATE_ABBREVIATION[state]+'\').hide(); \
                $(\'#unvisited'+STATE_ABBREVIATION[state]+'\').show();"> \
            See visited breweries \
        </button> \
        <button class="ui-button ui-widget ui-corner-all" \
            onclick="$(\'#visited'+STATE_ABBREVIATION[state]+'\').hide(); \
                $(\'#unvisited'+STATE_ABBREVIATION[state]+'\').hide();"> \
            Hide All \
        </button></center>')
        $("#list").append('<table id="visited'+STATE_ABBREVIATION[state]+'" class="stripe" style="width:45%; display:none; float: left;"> \
            <thead> \
                <tr> \
                    <th>Name</th> \
                </tr> \
            </thead> \
            <tbody> \
            </tbody> \
        </table>')
        $("#list").append('<table id="unvisited'+STATE_ABBREVIATION[state]+'" class="stripe" style="width:45%; display:none; float: right"> \
            <thead> \
                <tr> \
                    <th>Name</th> \
                </tr> \
            </thead> \
            <tbody> \
            </tbody> \
        </table>')
        $("#list").append('<div style="clear: both; display: block;position: relative ; float: none; width: 100%;></div>')
        // Add list of visited breweries
        var breweryList = ""
        $.each(fullBreweryArray, function( index, brewery) {
            var style = ""
            // If brewery is in the google sheets ignore array - color it red, but still display it
            if (!inBusinessBreweryArray.includes(brewery)) {
                style='style="color:red"'
            }
            else if (couldNotFindArray.includes(brewery)) {
                style='style="color:blue"'
            }
            // breweryList = breweryList + '<div class="brewery" '+style+'>'+brewery+'</div>'
            $('#visited'+STATE_ABBREVIATION[state]+' tbody').append("<tr><td "+style+">"+brewery+"</td></tr>")
        })
        $.each(unvisitedArray, function(index, brewery) {
            $('#unvisited'+STATE_ABBREVIATION[state]+' tbody').append("<tr><td>"+brewery+"</td></tr>")
        })
        // $( "#list" ).append('<div class="breweryList" id="breweryList'+STATE_ABBREVIATION[state]+'">'+breweryList+'</div>')

        // populate progress bar with percentage
        $( "#progressBar"+STATE_ABBREVIATION[state] ).progressbar({value: statusbarnum});
        $( "button" ).click( function( event ) {
            event.preventDefault();
        });
        $('#visited'+STATE_ABBREVIATION[state]).DataTable({
            "paging":   false,
            "info":     false,
            "searching":   false
        });
        $('#unvisited'+STATE_ABBREVIATION[state]).DataTable({
            "paging":   false,
            "info":     false,
            "searching":   false
        });
    });
}

function getAPIBreweries(state) {
    var dataReturn = ""
    $.ajax({
        url: "https://breweryapi.claytondavis.dev/api/brewery/state/"+STATE_ABBREVIATION[state]+"?field=name",
        async: false,
        method: "GET",    })
    .done(function( breweryapi_data ) {
        dataReturn = breweryapi_data
    })
    return dataReturn
}

function getSheetBreweries() {
    

    $.ajax({
        url: "https://sheets.googleapis.com/v4/spreadsheets/"+SHEET_ID+"/values/USA\!A2:P100?key="+API_KEY+"&majorDimension=COLUMNS"
    })
    .done(function( data ) {
        // console.log("SHEET DATA")
        // console.log(data)
        for (var i = 0; i < data['values'].length; i++) {
            var placeArray = data['values'][i]
            var fullBreweryArray = []
            var inBusinessBreweryArray = []

            var state = placeArray[0].split("(")[0].trim();
            console.log("--------------------")
            console.log(state)
            var unvisitedBreweries = getAPIBreweries(state)
            console.log("--Breweres Association List")
            console.log(unvisitedBreweries)
            var couldNotFindArray = []
            // console.log("state - "+state)
            for (var r = 1, place; place = placeArray[r]; r++) {
                // fullBreweryArray - is the array of all of the breweries
                fullBreweryArray.push(place)
                // Create inBusinessBreweryArray - for only breweries not in the ignore list - this is for the count
                if (!gsIgnoreList[STATE_ABBREVIATION[state]].includes(place)) {
                    inBusinessBreweryArray.push(place)
                }
                if (unvisitedBreweries.includes(place) ||
                    unvisitedBreweries.includes(place+" LLC") ||
                    unvisitedBreweries.includes(place+", LLC") ||
                    unvisitedBreweries.includes(place+".")) {
                    for( var x = 0; x < unvisitedBreweries.length; x++){ 
                        if ( unvisitedBreweries[x] == place ||
                            unvisitedBreweries[x] == place+" LLC" ||
                            unvisitedBreweries[x] == place+", LLC" ||
                            unvisitedBreweries[x] == place+".") { 
                                unvisitedBreweries.splice(x, 1); 
                        } else {
                            // console.log("Found but did not remove '"+place+"' OR '"+place+" LLC' OR '"+place+", LLC' OR '"+place+".'")
                        }
                    }
                } else {
                    couldNotFindArray.push(place)
                    // console.log("Could not find '"+place+"' OR '"+place+" LLC' OR '"+place+", LLC' OR '"+place+".'")
                }
            }

            var ignoredCount = 0
            console.log("-- IGNORE LIST")
            console.log(baIgnoreList[STATE_ABBREVIATION[state]])
            for (var y = 0; y < baIgnoreList[STATE_ABBREVIATION[state]].length; y++) {
                var ignoredPlaces = baIgnoreList[STATE_ABBREVIATION[state]]
                if (unvisitedBreweries.includes(ignoredPlaces[y])) {
                    for( var z = 0; z < unvisitedBreweries.length; z++){ 
                        if ( unvisitedBreweries[z] === ignoredPlaces[z]) { 
                            unvisitedBreweries.splice(z, 1); 
                            ignoredCount++
                        } else {
                            // console.log("Found but did not remove '"+place+"' OR '"+place+" LLC' OR '"+place+", LLC' OR '"+place+".'")
                        }
                    }
                } else {
                    console.log("Could not find '"+place+"' OR '"+place+" LLC' OR '"+place+", LLC' OR '"+place+".'")
                }
            }
            var breweryTotal = inBusinessBreweryArray.length;
            console.log("--Final unvisited breweries list")
            console.log(unvisitedBreweries)
            getStateBreweries(state, breweryTotal, fullBreweryArray, inBusinessBreweryArray, unvisitedBreweries, ignoredCount, couldNotFindArray)
        }
        $("#loading").hide()
        $("#info").show()
    });
    
}

getSheetBreweries()
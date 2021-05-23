/*
    OPEN BREWERY DB - API
    This was using the openbrewerydb api - but it was an incomplete database - the above is to hardcode for now
*/
// STATE_ABBREVIATION= {
//     "California": "CA",
//     "Colorado": "CO",
//     "Illinois": "IL",
//     "Indiana": "IN",
//     "Iowa": "IA",
//     "Minnesota": "MN",
//     "Michigan": "MI",
//     "Missouri": "MO",
//     "Nebraska": "NE",
//     "North Carolina": "NC",
//     "Washington": "WA",
//     "Wisconsin": "WI"
// }

// function getStateBreweries(state, stateVisitedTotal) {
//     page=1
//     moreBreweries=true
//     breweryCount=0

//     console.log(state)

//     while (moreBreweries) {
//         $.ajax({
//             url: "https://api.openbrewerydb.org/breweries?by_state="+STATE_ABBREVIATION[state]+"&per_page=50&page="+page,
//             async: false
//         })
//         .done(function( data ) {
//             breweryCount = breweryCount + data.length
//             console.log(breweryCount)
//             if (data.length < 50 || page > 20) {
//                 console.log("Visited Breweries: "+stateVisitedTotal)
//                 console.log("Total Breweries: "+breweryCount)

//                 var statusbarnum = Math.round((stateVisitedTotal / breweryCount) * 100)

//                 $( "#list" ).append('<div class="stateTitle">'+state+' '+statusbarnum+'% ('+stateVisitedTotal+'/'+breweryCount+')</div><div class="progressbar" id="progressBar'+STATE_ABBREVIATION[state]+'"></div>')

//                 $( "#progressBar"+STATE_ABBREVIATION[state] ).progressbar({value: statusbarnum});
//                 moreBreweries=false
//             }
//         });
//         page++
//     }
// }





/*
    HARDCODED
    Data from: https://www.brewersassociation.org/directories/breweries/
*/
// HARDCODED_BREWERY_TOTALS = {
//     "California": {
//         "Abbr": "CA",
//         "Total": 973
//     },
//     "Colorado": {
//         "Abbr": "CO",
//         "Total": 463
//     },
//     "Illinois": {
//         "Abbr": "IL",
//         "Total": 279
//     },
//     "Indiana": {
//         "Abbr": "IN",
//         "Total": 201
//     },
//     "Iowa": {
//         "Abbr": "IA",
//         "Total": 99
//     },
//     "Minnesota": {
//         "Abbr": "MN",
//         "Total": 197
//     },
//     "Michigan": {
//         "Abbr": "MI",
//         "Total": 386
//     },
//     "Missouri": {
//         "Abbr": "MO",
//         "Total": 135
//     },
//     "Nebraska": {
//         "Abbr": "NE",
//         "Total": 55
//     },
//     "North Carolina": {
//         "Abbr": "NC",
//         "Total": 333
//     },
//     "Washington": {
//         "Abbr": "WA",
//         "Total": 437
//     },
//     "Wisconsin": {
//         "Abbr": "WI",
//         "Total": 226
//     }
// }

// function getStateBreweries(state, stateVisitedTotal) {
//     var breweryCount = HARDCODED_BREWERY_TOTALS[state]["Total"]
//     var stateAbbr = HARDCODED_BREWERY_TOTALS[state]["Abbr"]

//     var statusbarnum = Math.round((stateVisitedTotal / breweryCount) * 100)

//     $( "#list" ).append('<div class="stateTitle">'+state+' '+statusbarnum+'% ('+stateVisitedTotal+'/'+breweryCount+')</div><div class="progressbar" id="progressBar'+stateAbbr+'"></div>')

//     $( "#progressBar"+stateAbbr ).progressbar({value: statusbarnum});
//     moreBreweries=false
// }






/*
    Parsing DOM from BrewersAssociation
    Data from: https://www.brewersassociation.org/directories/breweries/
*/
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

    $.ajax({
        url: "https://www.brewersassociation.org/wp-admin/admin-ajax.php",
        async: false,
        method: "POST",
        data: "action=get_breweries&_id="+state+"&search_by=statename"
    })
    .done(function( data ) {
        var breweryReturn = $.parseHTML(data)

        var breweryCount = 0
        $.each( breweryReturn, function( i, element ) {
            // Remove contract brewers and breweries in planning - Can't visit them... yet
            if ($("ul.brewery-info li.brewery_type a", element).text() != "Contract" && $("ul.brewery-info li.brewery_type a", element).text() != "Planning") {
                // Ensure that a name exists
                if ($("ul.brewery-info li.name", element).text() != "") {
                    // If the brewery name is not found in the exception list - increment the count
                    if (!baIgnoreList[STATE_ABBREVIATION[state]].includes($("ul.brewery-info li.name", element).text())) {
                        breweryCount++
                    } else {
                        // Remove from list once it is ignored - there are some duplicates that use the exact same name. Example WI - Good City Brewing Company
                        baIgnoreList[STATE_ABBREVIATION[state]].splice(baIgnoreList[STATE_ABBREVIATION[state]].indexOf($("ul.brewery-info li.name", element).text()), 1)
                    }
                }
            }
        });
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
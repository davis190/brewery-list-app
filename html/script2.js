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

function populatePage(state) {
    console.log(window.location.href)
}

function getBrewersAssociationBreweries(state) {
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
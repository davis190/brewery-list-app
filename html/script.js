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

    $("#gs_breweries").html("")
    $("#ba_breweries").html("")
    $("#main").html("")

    if (state != 'home') {
        $("#main").append("<h1>"+state+"</h1>")
        $("#main").append('<div id="progressBar"></div>')
        
        getBrewersAssociationBreweries(state)
        getGoogleSheetsBreweries(state)
    } else {

    }
}

function getBrewersAssociationBreweries(state) {
    var dataReturn = ""
    $.ajax({
        url: "https://breweryapi.claytondavis.dev/api/brewery/ba/state/"+STATE_ABBREVIATION[state],
        async: false,
        method: "GET",    })
    .done(function( breweryapi_data ) {
        console.log(breweryapi_data)
        $("#ba_breweries").append("<h2>Unvisited Breweries (<div style='display:inline' id='unvisited_total'></div>)</h2>")
        $("#ba_breweries").append("<ul>")
        var match_count = 0
        var unmatch_count = 0
        for (var i = 0; i < breweryapi_data.length; i++) {
            if (breweryapi_data[i]['status'] == 'match_found') {
                match_count++
            } else {
                unmatch_count++
                $("#ba_breweries").append("<li id=\""+breweryapi_data[i]['brewery_id']+"\">"+breweryapi_data[i]['brewery_name']+"</li>")
            }
        }
        $("#ba_breweries").append("</ul>")
        console.log("Unmatched: "+unmatch_count)
        $("#unvisited_total").html(unmatch_count)

        var statusbarnum = Math.round((match_count / breweryapi_data.length) * 100)
        console.log("Status bar num: "+statusbarnum)
        $( "#progressBar" ).html("<h6>BA Visited Breweries - "+match_count+"/"+breweryapi_data.length+" "+statusbarnum+"%</h6><div class=\"progress\"><div class=\"progress-bar\" role=\"progressbar\" style=\"width: "+statusbarnum+"%;\" aria-valuenow=\""+statusbarnum+"\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>")
    })
}

function getGoogleSheetsBreweries(state) {
    var dataReturn = ""
    $.ajax({
        url: "https://breweryapi.claytondavis.dev/api/brewery/gs/state/"+STATE_ABBREVIATION[state],
        async: false,
        method: "GET",    })
    .done(function( breweryapi_data ) {
        console.log(breweryapi_data)
        $("#gs_breweries").append("<h2>Visited Breweries (<div style='display:inline' id='visited_total'>"+breweryapi_data.length+"</div>)</h2>")
        $("#gs_breweries").append("<h6><i style='color:blue'>No match in BA data</i></h6>")
        $("#gs_breweries").append("<h6><i style='color:red'>Closed breweries</i></h6>")
        $("#gs_breweries").append("<ul>")
        for (var i = 0; i < breweryapi_data.length; i++) {
            var style = " style='color:blue' "
            if (breweryapi_data[i]['status'] == 'match_found') {
                style = ""
            } else if (breweryapi_data[i]['status'] == 'closed') {
                style = " style='color:red' "
            }
            $("#gs_breweries").append("<li"+style+">"+breweryapi_data[i]['brewery_name']+"</li>")
        }
        $("#gs_breweries").append("</ul>")
    })
}
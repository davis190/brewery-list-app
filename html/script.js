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





function populatePage(state) {
    console.log(window.location.href)

    $("#gs_breweries").html("")
    $("#ba_breweries").html("")
    $("#main").html("")

    if (state != 'home') {
        $("#main").append("<h1>"+state+"</h1>")
        $("#main").append('<div id="progressBar"></div>')

        $("ul.nav li").removeClass("active")
        $("#nav_"+state).parent().addClass("active")
        
        getBrewersAssociationBreweries(state)
        getGoogleSheetsBreweries(state)
    } else {
        populateHome()

        $("ul.nav li").removeClass("active")
        $("#nav_home").addClass("active")

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
                $("#ba_breweries").append("<li id=\""+breweryapi_data[i]['brewery_id']+"\">"+breweryapi_data[i]['brewery_name']+" ("+breweryapi_data[i]['city']+")</li>")
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
            if (breweryapi_data[i]['city']) {
                $("#gs_breweries").append("<li"+style+">"+breweryapi_data[i]['brewery_name']+" ("+breweryapi_data[i]['city']+")</li>")
            } else {
                $("#gs_breweries").append("<li"+style+">"+breweryapi_data[i]['brewery_name']+"</li>")
            }
        }
        $("#gs_breweries").append("</ul>")
    })
}

function populateNumbers() {
    if (!$("#nav_Wisconsin").html().includes("(")) {
        $.ajax({
            url: "https://breweryapi.claytondavis.dev/api/brewery/count",
            async: false,
            method: "GET",    })
        .done(function( count_data ) {
            console.log(count_data)
            for (const key in count_data) {
                $("#nav_"+key.replace(" ","_")).append(" ("+count_data[key]+")")
            }
        })
    }
}

function populateHome() {
    $("#main").append("<h1>Brewery List</h1>")
    $("#main").append("<p>The purpose of this site is to display all the breweries I have been to and compare that to a list of breweries from the <a href='https://www.brewersassociation.org/directories/breweries'>Brewers Association (BA)</a>. This is used to track my goal to visit a brewery in every state.</p>")

    $.ajax({
        url: "https://breweryapi.claytondavis.dev/api/brewery/count",
        async: false,
        method: "GET",    })
    .done(function( count_data ) {
        console.log(count_data)
        $("#main").append("<h5>Total states so far: "+Object.keys(count_data).length+"</h5>")
        var total_breweries = 0
        var indv_counts = ""
        for (const state in count_data) {
            indv_counts = indv_counts + "<h5>"+state+" - "+count_data[state]+"</h5>"
            total_breweries = count_data[state] + total_breweries
            // var statusbarnum = Math.round((count_data[state] / count_data['Wisconsin']) * 100)
            // $("#main").append('<div class="progress"> \
            //     <div class="progress-bar progress-bar-striped" role="progressbar" style="width: '+statusbarnum+'%" aria-valuenow="'+statusbarnum+'" aria-valuemin="0" aria-valuemax="100"></div> \
            // </div>')
        }
        $("#main").append("<h5>Total breweries so far: "+total_breweries+"</h5>")
        $("#main").append("<br /><h4>Breakdown by state</h4>")
        $("#main").append(indv_counts)
    })
}
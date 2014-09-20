var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Q = require('q');
var lodash = require('lodash');

var scrapeUtils = require('./scrapeUtils.js');
var Events = require('./events.js');

var events = new Events();

var baseUrl = 'http://baltimorebeerweek.com/events/';
//var dates = ['OCT11', 'OCT12'];
var dates = ['OCT11', 'OCT12', 'OCT13', 'OCT14', 'OCT15', 'OCT16', 'OCT17', 'OCT18', 'OCT19'];

// data holders
var locations;
var nextLocationId = -1;

// retrieve the list of current locations
var queryPromise = events.query("Location");
queryPromise.then(function(data) {

    locations = data;
    if (locations != null) {
        var maxLocation = lodash.max(data.entries, function (l) { return l.Id._; });
        nextLocationId = maxLocation.Id._ + 1;
    }

    processDates().then(function() {
        console.log("");
    });

});

function processDates() {
    var result = processDate('OCT10');
    dates.forEach(function(d) {
        result = result.then(function(events) {

            events.forEach(function(event) {
                //processEvent(event);
            });

            return processDate(d);
        });
    });
    
    return result;
}

function processDate(dateString) {
    var deferred = Q.defer();
    var url = baseUrl + dateString;

    var events = [];
    
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('div.event a').each(function () {
                var a = $(this);
                var title = a.text();
                if (title.indexOf("Read More") > -1) {
                    
                    var deepLinkUrl = a.attr('href').trim();

                    var eventName = a.parent().parent().children('h2').eq(0).children('a').text().trim();
                    
                    var details = a.parent().parent().children('p');
                    var parseDate = $(details).eq(0).text().trim();
                    var processDate = parseDate.replace("Date: ", "").split(" ");
                    var date = "2014-10-" + processDate[2].replace(",", "").substring(0, 2);

                    var location = $(details).eq(1).text().trim().replace("Location: ", "");

                    //var time = processDate[3].trim().split(",")[0].trim();
                    //time = time.replace(",", "");
                    //time = time.replace(":00", "");
                    var time = scrapeUtils.timeOfDay(parseDate);
                                        
                    var cost = $(details).eq(2).text().trim().replace("Cost: ", "");
                    cost = cost.replace("Fixed Price", "-1");
                    
                    if (cost.indexOf("Pay as you go") > -1) {
                        cost = "0";
                    }

                    cost = cost.replace("Free", "0");
                    cost = cost.replace("$$", "$");
                    cost = cost.replace("$", "");
                    cost = cost.replace(".00", "");
                    
                    if (cost.indexOf("-1") > -1 && cost != "-1") {
                        cost = cost.replace("$", "");
                        cost = cost.replace(",", " ");
                        cost = cost.replace("/", " ");

                        var costParts = cost.split(" ");
                        if (costParts.length >= 4) {
                            cost = costParts[3];
                        }

                        costParts = cost.split("-");
                        cost = cost[0];
                    }

                    var description = $(details).eq(4).text().trim();

                    var logoElement = null;
                    try {
                        logoElement = a.parent().parent().parent().children().eq(0).children().eq(0).children().eq(0).attr('src');
                    } catch (err) {
                        console.log(eventName);
                    } 
                    
                    var logoUrl = (logoElement != null) ? logoElement.trim() : 'http://bbw14.blob.core.windows.net/images/logo.png';

                    var event = {
                        eventName: eventName,
                        date: date,
                        time: time,
                        url: deepLinkUrl,
                        location: location,
                        locationLogo: logoUrl,
                        cost: cost,
                        description: description
                    };

                    processEvent(event);
                    events.push(event);
                }
            });

            deferred.resolve(events);
        }
    });

    return deferred.promise;
}

function processEvent(event) {
    request(event.url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('h3.title').each(function() {

                var address = $(this).text().trim().replace("Location: ", "");
                address = address.replace(" - Get Directions", "");
                var addressParts = address.split("-");
                if (addressParts.length > 1) {
                    address = addressParts[addressParts.length-1].trim();
                }     
                
                address = address.replace(event.location + " - ", "");
                
                if (event.location == "M & T Stadium Parking Lots") {
                    event.address = "1101 Russell Street Baltimore, MD  21230";
                } else {
                    event.address = address;
                }

                events.insertEvent(event);
            });
        }
    });
}

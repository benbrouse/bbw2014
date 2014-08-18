var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var q = require('q');

var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;

var nconf = require('nconf');
nconf.env()
     .file({ file: 'config.json' });
var tableName = nconf.get("TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");

var storageClient = azure.createTableService(accountName, accountKey);

storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
    if (error) {
        throw error;
    }
});

var baseUrl = 'http://baltimorebeerweek.com/events/';
//var dates = ['OCT11', 'OCT12'];
var dates = ['OCT10', 'OCT11', 'OCT12', 'OCT13', 'OCT14', 'OCT15', 'OCT16', 'OCT17', 'OCT18', 'OCT19'];

dates.forEach(processDates);

// console.log('completed');

function processDates(element, index, array) {
//    console.log("index: " + index + ", ele: " + element);
    processDate(element);
}

function processDate(dateString) {

    var url = baseUrl + dateString;


    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('div.event a').each(function (i, element) {
                
                var a = $(this);
                var title = a.text();
                if (title.indexOf("Read More") > -1) {
                    
                    var deepLinkUrl = a.attr('href').trim();

                    var eventName = a.parent().parent().children('h2').eq(0).children('a').text().trim();
                    
                    var details = a.parent().parent().children('p');
                    var processDate = $(details).eq(0).text().trim().replace("Date: ", "").split(" ");
                    var date = "10/" + processDate[2].replace(",", "") + "/2014";
                    var time = processDate[3].trim();
                    var location = $(details).eq(1).text().trim().replace("Location: ", "");
                    var cost = $(details).eq(2).text().trim().replace("Cost: ", "");
                    var description = $(details).eq(4).text().trim();

                    var logoUrl = a.parent().parent().parent().children().eq(0).children().eq(0).children().eq(0).attr('src').trim();

                    var event = {
                        PartitionKey: entityGen.String(partitionKey),
                        RowKey: entityGen.String(uuid()),
                        eventName: entityGen.String(eventName),
                        date: entityGen.String(date),
                        time: entityGen.String(time),
                        url: entityGen.String(deepLinkUrl),
                        location: entityGen.String(location),
                        locationLogo: entityGen.String(logoUrl),
                        cost: entityGen.String(cost),
                        description: entityGen.String(description)
                    };

                    processEvent(deepLinkUrl, location, event);
                     

                    console.log(event);


                    //fs.writeFile('events.json', JSON.stringify(event, null, 4), function(err) {

                    //    console.log('File successfully written! - Check your project directory for the output.json file');

                    //});


                    //fs.appendFile('data.csv', logoUrl + ',' + date + ',' + location + ',' + cost + ',' + description, function (err) {

                    //});


                    //console.log(title);
                    //console.log(deepLinkUrl);
                }
            });
        }
    });
}

function processEvent(url, location, event) {
    request(url, function(error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('h3.title').each(function (i, element) {

                var address = $(this).text().trim().replace("Location: ", "");
                address = address.replace(" - Get Directions", "");
                
                address = address.replace(location + " - ", "");

                event.address = entityGen.String(address);

                storageClient.insertEntity(tableName, event, function entityInserted(err1) {
                    if (err1) {
                        console.log('error');
                    }

                });
            });
        }
    });
}

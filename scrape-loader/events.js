var Q = require('q');
var azure = require('azure-storage');
var uuid = require('node-uuid');
var entityGen = azure.TableUtilities.entityGenerator;

///#region
var nconf = require('nconf');
nconf.env().file({ file: 'config.json' });

var tableName = nconf.get("TABLE_NAME");
var partitionKey = nconf.get("PARTITION_KEY");
var accountName = nconf.get("STORAGE_NAME");
var accountKey = nconf.get("STORAGE_KEY");

///#endregion

function Events() {
    readConfig();
}

Events.prototype.constructor = function() {
    this.ensureTableExists();
}

Events.prototype.ensureTableExists = function() {
    createTable();
}

Events.prototype.insertEvent = function(event) {
    
    if (event.location == "Non-Sponsor Venue") {
        event.address = "DO NOT LOAD";
    }

    var entity = {
        EventName: entityGen.String(event.eventName),
        EventDate: entityGen.String(event.date),
        EventTime: entityGen.String(event.time),
        SourceUrl: entityGen.String(event.url),
        LocationName: entityGen.String(event.location),
        LocationLogo: entityGen.String(event.locationLogo),
        EventCost: entityGen.String(event.cost),
        EventDescription: entityGen.String(event.description),
        LocationAddress: entityGen.String(event.address)
    };

    entity.PartitionKey = entityGen.String(partitionKey);
    entity.RowKey = entityGen.String(uuid());

    var client = createTable();
    client.insertEntity(tableName, entity, function entityInserted(err1) {
        if (err1) {
            console.log('error');
        }
    });
}

Events.prototype.query = function(tableName) {
    var deferred = Q.defer();

    var query = new azure.TableQuery().select();

    var client = createTable();
    client.queryEntities(tableName, query, null, function(error, result, response) {
        if (!error) {
            console.log('');
            // query was successful
            deferred.resolve(result);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

function readConfig() {

}

function createTable() {
    var storageClient = azure.createTableService(accountName, accountKey);

    storageClient.createTableIfNotExists(tableName, function tableCreated(error) {
        if (error) {
            throw error;
        }
    });

    return storageClient;
}



module.exports = Events;

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Microsoft.WindowsAzure.Storage.Table;
using server.Models;

namespace server.Data
{
    public class EventService : DataService<Event>
    {
        public EventService()
        {
            _tableName = Tables.EVENT;
        }

        public List<Event> RetrieveByName(string name, string date, int locationId)
        {
            Debug.Assert(String.IsNullOrEmpty(_tableName) != true);

            // retrieve the storage account to be used
            string storageAccountSetting = Configuration.GetSetting(ApplicationSettings.STORAGE_ACCOUNT);
            string accountId = Configuration.GetSetting(ApplicationSettings.ACCOUNT_ID);

            CloudTable table = GetTableReference(storageAccountSetting);


            // Construct the query operation for all customer entities where PartitionKey="Smith".
            TableQuery<Event> query = new TableQuery<Event>().Where(TableQuery.CombineFilters(
                TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, accountId),
                TableOperators.And,
                TableQuery.GenerateFilterCondition("Title", QueryComparisons.Equal, name)));
            
            var results = table.ExecuteQuery(query).ToList();
            results = results.Where(x => x.LocationId == locationId && x.Date.Contains(date)).ToList();

            return results;
        }

        public List<Event> GetMockData()
        {
            List<Event> events = new List<Event>
            {
                new Event
                {
                    Id = 0,
                    Title = "Event 0 Longer Title More Blah Blah Blah",
                    Date = "2014-10-10T20:44:55",
                    Cost = 9.99,
                    Description = "Description 1. The sly fox went to roost. Blah Blah.     Can you see this?",
                    Image = "img/temp/HS_logo_sl.png",
                    LocationId = 0,
                    Sponsors = new[] {0, 1}
                }
            };

            return events;
        }
    }
}
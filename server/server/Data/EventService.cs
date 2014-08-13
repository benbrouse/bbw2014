using System.Collections.Generic;
using server.Models;

namespace server.Data
{
    public class EventService : DataService<Event>
    {
        public EventService()
        {
            _tableName = Tables.EVENT;
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
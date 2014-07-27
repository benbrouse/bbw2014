using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class EventsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<Event> Get()
        {
            IEnumerable<Event> events = GetEventData();
            return events;
        }

        // GET api/<controller>/5
        public Event Get(int id)
        {
            IEnumerable<Event> events = GetEventData();
            Event theEvent = events.FirstOrDefault(x => x.Id == id);

            return theEvent;
        }

        private IEnumerable<Event> GetEventData()
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
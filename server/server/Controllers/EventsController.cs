using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class EventsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<Event> Get()
        {
            var dataService = new EventService();
            IEnumerable<Event> events = dataService.RetrieveAll();

            return events;
        }

        // GET api/<controller>/5
        public Event Get(int id)
        {
            var dataService = new EventService();
            Event theEvent = dataService.Retrieve(id);

            return theEvent;
        }
    }
}
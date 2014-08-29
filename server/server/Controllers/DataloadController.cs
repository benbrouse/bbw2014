using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class DataloadController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<EventLoad> Get()
        {
            var eventService = new EventService();
            var masterEvents = eventService.RetrieveAll();
            int nextEventKey = masterEvents.Max(e => e.Id);
            nextEventKey++;

            var locationService = new LocationService();
            var locations = locationService.RetrieveAll();
            int nextLocationKey = locations.Max(l => l.Id);
            nextLocationKey++;

            var dataService = new DataloadService();
            IEnumerable<EventLoad> events = dataService.RetrieveAll();

            // loop over each of the incoming events and make sure a location record has been created.
            foreach (var eventLoad in events)
            {
                Location eventLocation = null;

                var results = locationService.RetrieveByAddress(eventLoad.LocationAddress.Trim());
                if (results.Count > 0)
                {
                    eventLocation = results[0];
                }
                else
                {
                    var location = new Location();
                    location.Id = nextLocationKey;
                    location.Address = eventLoad.LocationAddress.Trim();
                    location.Name = eventLoad.LocationName.Trim();
                    location.Image = eventLoad.LocationLogo.Trim();

                    locationService.Save(location);
                    nextLocationKey++;

                    eventLocation = location;
                }

                // find a matching event
                var eventList = eventService.RetrieveByName(eventLoad.EventName.Trim());
                Event scheduledEvent = null;
                if (eventList.Count > 0)
                {
                    var matchingEvents = eventList.Where(e => e.LocationId == eventLocation.Id).ToList();
                    if (matchingEvents.Count > 0)
                    {
                        scheduledEvent = matchingEvents[0];
                    }
                }

                if (scheduledEvent == null)
                {
                    var newEvent = new Event();
                    newEvent.Id = nextEventKey;
                    newEvent.Title = eventLoad.EventName.Trim();
                    newEvent.Image = "";
                    newEvent.Cost = Int32.Parse(eventLoad.EventCost.Trim());
                    newEvent.Date = String.Format("{0}T{1}", eventLoad.EventDate.Trim(), eventLoad.EventTime.Trim());
                    newEvent.Description = eventLoad.EventDescription.Trim();
                    newEvent.LocationId = eventLocation.Id;

                    eventService.Save(newEvent);
                    nextEventKey++;
                }
                else
                {
                    scheduledEvent.Description = eventLoad.EventDescription.Trim();
                    scheduledEvent.Date = String.Format("{0}T{1}", eventLoad.EventDate.Trim(), eventLoad.EventTime.Trim());
                    eventService.Save(scheduledEvent);
                }
            }

            return events;
        }
    }
}

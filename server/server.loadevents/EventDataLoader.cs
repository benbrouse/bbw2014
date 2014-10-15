using System;
using System.Collections.Generic;
using System.Linq;
using server.Data;
using server.Models;

namespace server.loadevents
{
    public class EventDataLoader
    {
        public static void Execute()
        {
            var eventService = new EventService();
            var masterEvents = eventService.RetrieveAll();

            int nextEventKey = (masterEvents != null && masterEvents.Any()) ? masterEvents.Max(e => e.Id) : 0;
            nextEventKey++;

            var locationService = new LocationService();
            var locations = locationService.RetrieveAll();
            int nextLocationKey = (locations != null && locations.Any()) ? locations.Max(l => l.Id) : 0;
            nextLocationKey++;

            var dataService = new DataloadService();
            IEnumerable<EventLoad> events = dataService.RetrieveAll();

            // loop over each of the incoming events and make sure a location record has been created.
            int processed = 0;
            foreach (var eventLoad in events)
            {
                if (!eventLoad.IsValid())
                {
                    continue;
                }

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
                var eventList = eventService.RetrieveByName(eventLoad.EventName.Trim(), eventLoad.EventDate, eventLocation.Id);
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
                    newEvent.SourceUrl = eventLoad.SourceUrl;

                    eventService.Save(newEvent);
                    nextEventKey++;
                }
                else
                {
                    scheduledEvent.SourceUrl = eventLoad.SourceUrl;
                    scheduledEvent.Description = eventLoad.EventDescription.Trim();
                    //scheduledEvent.Date = String.Format("{0}T{1}", eventLoad.EventDate.Trim(), eventLoad.EventTime.Trim());
                    eventService.Save(scheduledEvent);
                }

                processed++;
            }            
        }
    }
}

using System.Web.Mvc;
using server.Data;

namespace server.Controllers
{
    public class MockDataController : Controller
    {
        public ActionResult Populate()
        {
            // populate sponsors
            var sponsorService = new SponsorService();

            var sponsorList = sponsorService.GetMockData();
            foreach (var sponsor in sponsorList)
            {
                sponsorService.Save(sponsor);
            }

            // populate locations
            var locationService = new LocationService();

            var locationList = locationService.GetMockData();
            foreach (var location in locationList)
            {
                locationService.Save(location);
            }

            // populate events
            var eventService = new EventService();

            var eventList = eventService.GetMockData();
            foreach (var eventDetail in eventList)
            {
                eventService.Save(eventDetail);
            }

            return new ContentResult();
        }
    }
}
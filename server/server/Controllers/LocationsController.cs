using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class LocationsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<Location> Get()
        {
            IEnumerable<Location> locations = GetLocationsData();
            return locations;
        }

        private IEnumerable<Location> GetLocationsData()
        {
            List<Location> locations = new List<Location>
            {
                new Location
                {
                    Id = 0,
                    Name = "Metropolitan",
                    Address = "902 S Charles St, Baltimore, MD 21230",
                    Image = "img/temp/HS_logo_sl.png",
                },

                new Location
                {
                    Id = 1,
                    Name = "Max\'s Taphouse",
                    Address = "737 S Broadway, Baltimore, MD 21231",
                    Image = "img/temp/Maxs_New_sl.png",
                },

                new Location
                {
                    Id = 2,
                    Name = "Barflys",
                    Address = "620 E Fort Ave, Baltimore, MD 21230",
                    Image = "img/temp/barflys_logo.png",
                },

                new Location
                {
                    Id = 3,
                    Name = "Home",
                    Address = "304 Thackery Ave, Catonsville, MD 21228",
                    Image = "img/temp/barflys_logo.png",
                }
            
            };

            return locations;
        }
    }
}
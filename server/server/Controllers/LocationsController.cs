using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class LocationsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<Location> Get()
        {
            var dataService = new LocationService();
            IEnumerable<Location> locations = dataService.RetrieveAll();

            return locations;
        }
    }
}
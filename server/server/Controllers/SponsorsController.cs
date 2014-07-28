using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Data;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class SponsorsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<Sponsor> Get()
        {
            var dataService = new SponsorService();
            IEnumerable<Sponsor> sponsors = dataService.RetrieveAll();

            return sponsors;
        }

        // GET api/<controller>/5
        public Sponsor Get(int id)
        {
            var dataService = new SponsorService();
            Sponsor sponsor = dataService.Retrieve(id);

            return sponsor;
        }
    }
}
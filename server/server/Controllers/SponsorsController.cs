using System.Collections.Generic;
using System.Linq;
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
            IEnumerable<Sponsor> sponsors = SponsorService.RetrieveAll(Tables.SPONSOR);
            return sponsors;
        }

        // GET api/<controller>/5
        public Sponsor Get(int id)
        {
            IEnumerable<Sponsor> sponsors = SponsorService.RetrieveAll(Tables.SPONSOR);
            Sponsor sponsor = sponsors.FirstOrDefault(x => x.Id == id);

            return sponsor;
        }
    }
}
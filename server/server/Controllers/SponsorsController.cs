using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using server.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class SponsorsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<Sponsor> Get()
        {
            List<Sponsor> sponsors = GetSponsorData();
            return sponsors;
        }

        // GET api/<controller>/5
        public Sponsor Get(int id)
        {
            List<Sponsor> sponsors = GetSponsorData();
            Sponsor sponsor = sponsors.FirstOrDefault(x => x.Id == id);

            return sponsor;
        }

        #region Mock Data

        private List<Sponsor> GetSponsorData()
        {
            List<Sponsor> sponsors = new List<Sponsor>();

            sponsors.Add(new Sponsor
            {
                Id = 0,
                Level = 0,
                Title = "Heavy Seas",
                Image = "img/temp/HS_logo_sl.png",
                Description = "This is the description for Heavy Seas.",
                Location = new SponsorLocation
                {
                    Address1 = "4615 Hollins Ferry Rd",
                    Address2 = "Halethorpe, MD 21227",
                },
                Phone = "4102477822",
                Url = "http://www.hsbeer.com",
                Twitter = "@HeavySeasBeer"
            });

            sponsors.Add(new Sponsor
            {
                Id = 1,
                Level = 1,
                Title = "Metropolitan",
                Image = "img/temp/metro_logo_sl.png",
                Description = "This is the description for Metropolitan.",
                Location = new SponsorLocation
                {
                    Address1 = "902 S. Charles Street",
                    Address2 = "Baltimore, MD 21230",
                },
                Phone = "4102340235",
                Url = "http://www.metrobalto.com/"
            });

            sponsors.Add(new Sponsor
            {
                Id = 2,
                Level = 1,
                Title = "Max\'s Tap House",
                Image = "img/temp/Maxs_New_sl.png",
                Description = "This is the description for Max\'s"
            });

            sponsors.Add(new Sponsor
            {
                Id = 3,
                Level = 2,
                Title = "Brewer\'s Art'",
                Image = "img/temp/brewers-art.png",
                Description = "Another description for Brewer\'s Art.",
                Location = new SponsorLocation
                {
                    Address1 = "1106 North Charles Street",
                    Address2 = "Baltimore, MD 21201",
                },
                Phone = "4105476925"
            });

            return sponsors;
        }
        #endregion
    }
}
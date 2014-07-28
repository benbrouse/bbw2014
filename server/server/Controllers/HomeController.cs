using System.Web.Mvc;
using server.Data;

namespace server.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";

            return View();
        }

        public ActionResult Insert()
        {
            var sponsorList = SponsorService.GetMockData();
            foreach (var sponsor in sponsorList)
            {
                SponsorService.Save(sponsor);
            }
      
            return new ContentResult();
        }
    }
}

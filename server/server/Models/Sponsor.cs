using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace server.Models
{
    public class Sponsor
    {
        public int Id;
       
        public int Level;
        public string Title;
        public string Image;
        public string Description;

        public SponsorLocation Location;

        public string Phone;
        public string Url;
        public string Twitter;
    }
}
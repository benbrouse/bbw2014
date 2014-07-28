using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage.Table;
using Wintellect.Azure.Storage.Table;

namespace server.Models
{
    public class Location
    {
        public int Id;
        public string Name;
        public string Address;
        public string Image;
    }
}
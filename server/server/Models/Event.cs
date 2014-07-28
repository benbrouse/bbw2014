using Microsoft.WindowsAzure.Storage.Table;

namespace server.Models
{
    public class Event : TableEntity
    {
        public int Id;
        public string Title;
        public string Date;
        public double Cost;
        public string Description;
        public string Image;
        public int LocationId;
        public int[] Sponsors;
    }
}
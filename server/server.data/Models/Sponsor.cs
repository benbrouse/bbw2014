namespace server.Models
{
    public class Sponsor : Entity
    {
        public Sponsor()
        {
            
        }

        public Sponsor(string partitionKey, string rowKey) : base(partitionKey, rowKey)
        {
        }

        public int Level { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public string Description { get; set; }

        public SponsorLocation Location { get; set; }

        public string Phone { get; set; }
        public string Url { get; set; }
        public string Twitter { get; set; }
    }
}
namespace server.Models
{
    public class Event : Entity
    {
        public Event()
        {
            
        }

        public Event(string partitionKey, string rowKey)
            : base(partitionKey, rowKey)
        {
        }

        public string Title { get; set; }
        public string Date { get; set; }
        public double Cost { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }
        public int LocationId { get; set; }
        public int[] Sponsors { get; set; }

        public string SourceUrl { get; set; }    
    }
}
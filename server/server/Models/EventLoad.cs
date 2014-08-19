namespace server.Models
{
    public class EventLoad : Entity
    {
        public EventLoad()
        {
        }

        public EventLoad(string partitionKey, string rowKey)
            : base(partitionKey, rowKey)
        {
        }

        public string SourceUrl { get; set; }

        public string EventName { get; set; }
        public string EventDate { get; set; }
        public string EventTime { get; set; }
        public string EventCost { get; set; }
        public string EventDescription { get; set; }

        public string LocationName { get; set; }
        public string LocationAddress { get; set; }
        public string LocationLogo { get; set; }
    }
}
using System;

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

        public bool IsValid()
        {
            bool valid = !this.LocationName.ToLowerInvariant().Contains("non-sponsor");

            if (valid && this.EventName.ToLowerInvariant().Contains("opening tap cele"))
                valid = false;

            if (valid && this.EventTime.ToLowerInvariant() == "nan:00:00")
                valid = false;

            if (valid && String.IsNullOrEmpty(this.LocationName.Trim()))
                valid = false;

            if (valid && String.IsNullOrEmpty(this.LocationLogo.Trim()))
                valid = false;

            if (valid && String.IsNullOrEmpty(this.LocationAddress.Trim()))
                valid = false;

            if (valid && String.IsNullOrEmpty(this.EventTime))
                valid = false;

            int cost;
            if (! Int32.TryParse(this.EventCost, out cost))
                valid = false;

            return valid;
        }
    }
}
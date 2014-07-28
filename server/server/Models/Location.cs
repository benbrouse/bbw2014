namespace server.Models
{
    public class Location : Entity
    {
        public Location()
        {
            
        }

        public Location(string partitionKey, string rowKey)
            : base(partitionKey, rowKey)
        {
        }


        public string Name { get; set; }
        public string Address { get; set; }
        public string Image { get; set; }
    }
}
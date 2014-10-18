using server.Models;

namespace server.data.Models
{
    public class MarkdownContent : Entity
    {
        public MarkdownContent()
        {
            
        }

        public MarkdownContent(string partitionKey, string rowKey)
            : base(partitionKey, rowKey)
        {
        }

        public string Data { get; set; }
    }
}

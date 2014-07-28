using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage.Table;

namespace server.Models
{
    public class Entity : TableEntity
    {
        public Entity()
        {
            
        }

        public Entity(string partitionKey, string rowKey)
        {
            this.PartitionKey = partitionKey;
            this.RowKey = rowKey;
        }

        public int Id { get; set; }
    }
}
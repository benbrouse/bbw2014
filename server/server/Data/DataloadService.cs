using server.Models;

namespace server.Data
{
    public class DataloadService : DataService<EventLoad>
    {
        public DataloadService()
        {
            _tableName = Tables.EVENT_IMPORT;
        }
    }
}
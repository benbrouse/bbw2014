using System.Configuration;

namespace server.Data
{
    public class ApplicationSettings
    {
        public static string STORAGE_ACCOUNT = "StorageConnectionString";
        public static string ACCOUNT_ID = "AccountID";
    }

    public class Tables
    {
        public static string SPONSOR = "Sponsor";
        public static string EVENT = "Event";
        public static string LOCATION = "Location";
        public static string EVENT_IMPORT = "EventsImport";
    }
    
    public class Configuration
    {
        public static string GetSetting(string key)
        {
            var appSettings = ConfigurationManager.AppSettings;
            return appSettings[key];
        }
    }
}
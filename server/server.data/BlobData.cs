using server.Data;
using Microsoft.WindowsAzure.Storage;

namespace server.data
{
    public class BlobData
    {
        public static string Retrieve(string blobName)
        {
            string storageAccountSetting = Configuration.GetSetting(ApplicationSettings.STORAGE_ACCOUNT);
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(storageAccountSetting);

            var blobClient = storageAccount.CreateCloudBlobClient();
            var container = blobClient.GetContainerReference("content");

            var blockBlob = container.GetBlockBlobReference(blobName);
            string text = blockBlob.DownloadText();

            return text;
        }
    }
}

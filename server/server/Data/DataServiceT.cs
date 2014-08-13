using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using server.Models;

namespace server.Data
{
    public class DataService<T> where T : Entity, new()
    {
        protected string _tableName = null;

        public void Save(T entity)
        {
            Debug.Assert(entity != null);
            Debug.Assert(String.IsNullOrEmpty(_tableName) != true);

            // retrieve the storage account to be used
            string storageAccountSetting = Configuration.GetSetting(ApplicationSettings.STORAGE_ACCOUNT);
            string accountId = Configuration.GetSetting(ApplicationSettings.ACCOUNT_ID);

            CloudTable table = GetTableReference(storageAccountSetting);

            // establish key values for the entity
            entity.PartitionKey = accountId;
            entity.RowKey = entity.Id.ToString(CultureInfo.InvariantCulture);

            // Create the InsertOrReplace TableOperation
            TableOperation insertOrReplaceOperation = TableOperation.InsertOrReplace(entity);
            table.Execute(insertOrReplaceOperation);
        }

        public void Delete(T entity)
        {
            Debug.Assert(entity != null);
            Debug.Assert(String.IsNullOrEmpty(_tableName) != true);

            // retrieve the storage account to be used
            string storageAccountSetting = Configuration.GetSetting(ApplicationSettings.STORAGE_ACCOUNT);
            string accountId = Configuration.GetSetting(ApplicationSettings.ACCOUNT_ID);

            CloudTable table = GetTableReference(storageAccountSetting);

            // establish key values for the entity
            entity.PartitionKey = accountId;
            entity.RowKey = entity.Id.ToString(CultureInfo.InvariantCulture);

            var deleteOperation = TableOperation.Delete(entity);
            table.Execute(deleteOperation);
        }

        public IEnumerable<T> RetrieveAll() 
        {
            Debug.Assert(String.IsNullOrEmpty(_tableName) != true);

            // retrieve the storage account to be used
            string storageAccountSetting = Configuration.GetSetting(ApplicationSettings.STORAGE_ACCOUNT);
            string accountId = Configuration.GetSetting(ApplicationSettings.ACCOUNT_ID);

            CloudTable table = GetTableReference(storageAccountSetting);
            TableQuery<T> query = new TableQuery<T>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, accountId));

            IEnumerable<T> results = table.ExecuteQuery(query);
            return results;
        }

        public T Retrieve(int id)
        {
            Debug.Assert(String.IsNullOrEmpty(_tableName) != true);

            // retrieve the storage account to be used
            string storageAccountSetting = Configuration.GetSetting(ApplicationSettings.STORAGE_ACCOUNT);
            string accountId = Configuration.GetSetting(ApplicationSettings.ACCOUNT_ID);

            CloudTable table = GetTableReference(storageAccountSetting);

            // establish key values for the entity
            T entity = default(T);

            // retrieve the details about the file
            TableOperation retrieveOperation = TableOperation.Retrieve<Sponsor>(accountId, id.ToString(CultureInfo.InvariantCulture));
            TableResult retrievedResult = table.Execute(retrieveOperation);

            if (retrievedResult.Result != null)
            {
                entity = (T)retrievedResult.Result;
            }

            return entity;
        }

        #region Implementation
        private CloudTable GetTableReference(string storageAccountSetting)
        {
            CloudStorageAccount storageAccount = CloudStorageAccount.Parse(storageAccountSetting);

            CloudTableClient tableClient = storageAccount.CreateCloudTableClient();
            CloudTable table = tableClient.GetTableReference(_tableName);
            table.CreateIfNotExists();

            return table;
        }
        #endregion
    }
}
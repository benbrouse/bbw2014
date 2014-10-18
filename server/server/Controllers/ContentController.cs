using System;
using System.Collections.Generic;
using System.Web.Http;
using System.Web.Http.Cors;
using server.data;
using server.data.Models;

namespace server.Controllers
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ContentController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            var entities = new String[] {"about-summary"};
            return entities;
        }

        // GET api/<controller>/5
        public MarkdownContent Get(string id)
        {

            string text = BlobData.Retrieve(id);
            var entity = new MarkdownContent { Data = text };

            return entity;
        }
    }
}

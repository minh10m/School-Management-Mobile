using Pgvector;
using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.Domain
{
    public class KnowledgeBase
    {
        [Key]
        public Guid Id { get; set; }

        public string Content { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;

        public Vector Embedding { get; set; }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class KnowledgeBaseConfiguration : IEntityTypeConfiguration<KnowledgeBase>
    {
        public void Configure(EntityTypeBuilder<KnowledgeBase> builder)
        {
            builder.Property(x => x.Content)
                   .IsRequired();

            builder.Property(x => x.Embedding)
                   .HasColumnType("vector(3072)");

            //builder.HasIndex(x => x.Embedding)
            //       .HasMethod("ivfflat")
            //       .HasOperators("vector_cosine_ops");
        }
    }
}

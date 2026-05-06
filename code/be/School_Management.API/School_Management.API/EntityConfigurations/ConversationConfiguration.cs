using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ConversationConfiguration : IEntityTypeConfiguration<Conversation>
    {
        public void Configure(EntityTypeBuilder<Conversation> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.IsGroup).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.HasOne(x => x.LastMessage)
               .WithMany() 
               .HasForeignKey(x => x.LastMessageId)
               .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

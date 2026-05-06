using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.SenderId).IsRequired();
            builder.Property(x => x.Content).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.ConversationId).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.HasOne(x => x.User)
               .WithMany(u => u.Messages)
               .HasForeignKey(x => x.SenderId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Conversation)
                   .WithMany(c => c.Messages)
                   .HasForeignKey(x => x.ConversationId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

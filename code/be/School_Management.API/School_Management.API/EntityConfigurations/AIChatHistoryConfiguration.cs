using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class AIChatHistoryConfiguration : IEntityTypeConfiguration<AIChatHistory>
    {
        public void Configure(EntityTypeBuilder<AIChatHistory> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Role).IsRequired().HasMaxLength(30);
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.Content).IsRequired();
        }
    }
}

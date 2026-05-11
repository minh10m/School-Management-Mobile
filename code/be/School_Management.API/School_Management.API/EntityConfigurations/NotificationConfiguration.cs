using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Content).IsRequired().HasMaxLength(400);
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.IsPopup).IsRequired();
            builder.Property(x => x.IsRead).IsRequired();
            builder.Property(x => x.Title).IsRequired().HasMaxLength(80);
            builder.Property(x => x.Type).IsRequired().HasMaxLength(50);
            builder.Property(x => x.SchoolYear).IsRequired();

            builder.ToTable(x => x.HasCheckConstraint("CK_SchoolYear_Notification",
                "\"SchoolYear\" >= 2000 AND \"SchoolYear\" < 2100"));

            builder.HasIndex(x => new { x.UserId, x.IsPopup, x.CreatedAt });
        }
    }
}

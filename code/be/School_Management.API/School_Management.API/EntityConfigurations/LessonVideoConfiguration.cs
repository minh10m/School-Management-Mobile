using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class LessonVideoConfiguration : IEntityTypeConfiguration<LessonVideo>
    {
        public void Configure(EntityTypeBuilder<LessonVideo> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.IsPreview).IsRequired();
            builder.Property(x => x.LessonId).IsRequired();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
            builder.Property(x => x.Duration).IsRequired();
            builder.Property(x => x.Url).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.OrderIndex).IsRequired();

            builder.ToTable("LessonVideo", x =>
            {
                x.HasCheckConstraint("CK_Duration_LessonVideo", "\"Duration\" > 0");
                x.HasCheckConstraint("CK_OrderIndex_LessonVideo", "\"OrderIndex\" > 0");
            });
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
    {
        public void Configure(EntityTypeBuilder<Lesson> builder)
        {
            builder.Property(x => x.CourseId).IsRequired();
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.LessonName).IsRequired().HasMaxLength(500);
            builder.Property(x => x.OrderIndex).IsRequired();
            builder.HasIndex(x => new { x.CourseId, x.OrderIndex }).IsUnique();

            builder.ToTable(x => x.HasCheckConstraint("CK_OrderIndex_Lesson", "\"OrderIndex\" > 0"));
        }
    }
}

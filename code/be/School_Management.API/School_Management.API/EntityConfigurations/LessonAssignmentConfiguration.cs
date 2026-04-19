using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class LessonAssignmentConfiguration : IEntityTypeConfiguration<LessonAssignment>
    {
        public void Configure(EntityTypeBuilder<LessonAssignment> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.Title).IsRequired().HasMaxLength(100);
            builder.Property(x => x.FileTitle).IsRequired().HasMaxLength(1000);
            builder.Property(x => x.FileUrl).IsRequired().HasMaxLength(300);
            builder.Property(x => x.LessonId).IsRequired();
            builder.Property(x => x.OrderIndex).IsRequired();

            builder.HasIndex(x => new { x.LessonId, x.Title }).IsUnique();
            builder.ToTable(x => x.HasCheckConstraint("CK_OrderIndex_CourseAssignment", "\"OrderIndex\" > 0"));
        }
    }
}

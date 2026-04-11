using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class CourseConfiguration : IEntityTypeConfiguration<Course>
    {
        public void Configure(EntityTypeBuilder<Course> builder)
        {
            builder.Property(x => x.CourseName).HasMaxLength(200).IsRequired();
            builder.Property(x => x.price).IsRequired().HasColumnType("decimal(18,2)");
            builder.Property(x => x.TeacherSubjectId).IsRequired();
            builder.Property(x => x.Status).IsRequired().HasMaxLength(60);
            builder.Property(x => x.Description).IsRequired();
        }
    }
}

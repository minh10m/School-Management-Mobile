using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class EnrollCourseConfiguration : IEntityTypeConfiguration<EnrollCourse>
    {
        public void Configure(EntityTypeBuilder<EnrollCourse> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.CourseId).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.EnrolledAt).IsRequired();

            builder.HasIndex(x => new { x.CourseId, x.StudentId }).IsUnique();
        }
    }
}

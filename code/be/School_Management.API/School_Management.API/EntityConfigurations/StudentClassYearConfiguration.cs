using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class StudentClassYearConfiguration : IEntityTypeConfiguration<StudentClassYear>
    {
        public void Configure(EntityTypeBuilder<StudentClassYear> builder)
        {
            builder.HasIndex(x => new { x.ClassYearId, x.StudentId }).IsUnique();
            builder.HasIndex(x => new { x.StudentId, x.SchoolYear }).IsUnique();
            builder.Property(x => x.ClassYearId).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.SchoolYear).IsRequired();
        }
    }
}

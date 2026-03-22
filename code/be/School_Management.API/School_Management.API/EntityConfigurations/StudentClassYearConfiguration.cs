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
        }
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ExamStudentAssignmentConfiguration : IEntityTypeConfiguration<ExamStudentAssignment>
    {
        public void Configure(EntityTypeBuilder<ExamStudentAssignment> builder)
        {
            builder.Property(x => x.ExamScheduleDetailId).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.IdentificationNumber).HasMaxLength(30);

            builder.HasIndex(x => new { x.ExamScheduleDetailId, x.StudentId }).IsUnique();
        }
    }
}

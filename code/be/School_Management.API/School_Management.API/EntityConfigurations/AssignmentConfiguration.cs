using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class AssignmentConfiguration : IEntityTypeConfiguration<Assignment>
    {
        public void Configure(EntityTypeBuilder<Assignment> builder)
        {
            builder.Property(x => x.Title).HasMaxLength(400).IsRequired();
            builder.Property(x => x.FileTitle).HasMaxLength(250);
            builder.Property(x => x.FileUrl).HasMaxLength(2048);
            builder.Property(x => x.TeacherSubjectId).IsRequired();
            builder.Property(x => x.ClassYearId).IsRequired();
            builder.Property(x => x.StartTime).IsRequired();
            builder.Property(x => x.FinishTime).IsRequired();
            builder.Property(x => x.PublicId).HasMaxLength(300);
            builder.ToTable(x => x.HasCheckConstraint(
                "CK_Time_Assignment", "\"StartTime\" < \"FinishTime\""));
        }
    }
}

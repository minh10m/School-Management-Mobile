using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ExamScheduleConfiguration : IEntityTypeConfiguration<ExamSchedule>
    {
        public void Configure(EntityTypeBuilder<ExamSchedule> builder)
        {
            builder.Property(x => x.Type).HasMaxLength(100).IsRequired();
            builder.Property(x => x.Term).IsRequired();
            builder.Property(x => x.SchoolYear).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();
            builder.Property(x => x.Grade).IsRequired();

            builder.ToTable("ExamSchedule", x =>
            {
                x.HasCheckConstraint("CK_SchoolYear_ExamSchedule", "\"SchoolYear\" > 2000 AND \"SchoolYear\" < 2100");
                x.HasCheckConstraint("CK_Term_ExamSchedule", "\"Term\" >= 1 AND \"Term\" <= 2");
                x.HasCheckConstraint("CK_Grade_ExamSchedule", "\"Grade\" >= 10 AND \"Grade\" <= 12");
            });

            builder.HasIndex(x => new { x.Type, x.Term, x.Grade, x.SchoolYear, x.IsActive }).IsUnique();
        }
    }
}

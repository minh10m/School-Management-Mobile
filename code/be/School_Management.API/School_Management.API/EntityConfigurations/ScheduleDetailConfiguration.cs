using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ScheduleDetailConfiguration : IEntityTypeConfiguration<ScheduleDetail>
    {
        public void Configure(EntityTypeBuilder<ScheduleDetail> builder)
        {
            builder.HasIndex(x => x.DayOfWeek);
            builder.HasIndex(x => x.ScheduleId);
            builder.Property(x => x.DayOfWeek).IsRequired();
            builder.Property(x => x.StartTime).IsRequired();
            builder.Property(x => x.FinishTime).IsRequired();
            builder.Property(x => x.ScheduleId).IsRequired();
            builder.Property(x => x.TeacherSubjectId).IsRequired();
            builder.ToTable(x => x.HasCheckConstraint("CK_Time_Detail", "\"FinishTime\" > \"StartTime\""));
        }
    }
}

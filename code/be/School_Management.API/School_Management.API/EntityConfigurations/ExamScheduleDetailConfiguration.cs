using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ExamScheduleDetailConfiguration : IEntityTypeConfiguration<ExamScheduleDetail>
    {
        public void Configure(EntityTypeBuilder<ExamScheduleDetail> builder)
        {
            builder.Property(x => x.ExamScheduleId).IsRequired();
            builder.Property(x => x.SubjectId).IsRequired();
            builder.Property(x => x.StartTime).IsRequired();
            builder.Property(x => x.FinishTime).IsRequired();
            builder.Property(x => x.Date).IsRequired();
            builder.Property(x => x.RoomName).HasMaxLength(20).IsRequired();

            builder.ToTable(x => x.HasCheckConstraint("CK_Time_ExamScheduleDetail", "\"FinishTime\" > \"StartTime\""));
        }
    }
}

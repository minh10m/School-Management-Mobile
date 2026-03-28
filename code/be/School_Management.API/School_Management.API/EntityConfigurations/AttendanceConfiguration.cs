using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
    {
        public void Configure(EntityTypeBuilder<Attendance> builder)
        {
            builder.Property(x => x.Note).HasMaxLength(200);
            builder.Property(x => x.Date).IsRequired();
            builder.Property(x => x.Status).IsRequired();
            builder.Property(x => x.StudentClassYearId).IsRequired();
            builder.HasIndex(x => new { x.StudentClassYearId, x.Date }).IsUnique();
            builder.ToTable(x => x.HasCheckConstraint("CK_Status_Attendance", "\"Status\" IN ('Vắng mặt', 'Đi trễ', 'Có mặt')"));
        }
    }
}

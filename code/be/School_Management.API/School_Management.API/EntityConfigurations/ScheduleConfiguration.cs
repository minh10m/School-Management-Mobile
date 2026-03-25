using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
    {
        public void Configure(EntityTypeBuilder<Schedule> builder)
        {
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.ClassYearId).IsRequired();
            builder.Property(x => x.Term).IsRequired();
            builder.Property(x => x.SchoolYear).IsRequired();
            builder.ToTable(t => t.HasCheckConstraint("CK_Term_Schedule", "\"Term\" >= 1 AND \"Term\" <= 2"));
            builder.HasIndex(t => new { t.ClassYearId, t.Term, t.SchoolYear, t.Name }).IsUnique();
        }
    }
}

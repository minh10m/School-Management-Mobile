using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class SubjectConfiguration : IEntityTypeConfiguration<Subject>
    {
        public void Configure(EntityTypeBuilder<Subject> builder)
        {
            builder.Property(x => x.SubjectName)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(x => x.MaxPeriod)
                .IsRequired();
            builder.HasIndex(x => x.SubjectName).IsUnique();
            builder.ToTable(x => x.HasCheckConstraint("CK_MaxPeriod_Subject", "\"MaxPeriod\" > 0 AND \"MaxPeriod\" <= 5"));
        }
    }
}

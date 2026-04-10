using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ClassYearConfiguration : IEntityTypeConfiguration<ClassYear>
    {
        public void Configure(EntityTypeBuilder<ClassYear> builder)
        {
            builder.Property(x => x.ClassName)
                .HasMaxLength(10)
                .IsRequired();

            builder.ToTable(t => t.HasCheckConstraint(
                "CK_ClassYear_Grade", "\"Grade\" >= 10 AND \"Grade\" <= 12"));

            builder.Property(x => x.HomeRoomId)
                .IsRequired(false);

            builder.Property(x => x.Grade)
                .IsRequired();

            builder.Property(x => x.SchoolYear)
                .IsRequired();

            builder.HasIndex(x => new { x.SchoolYear, x.ClassName })
                .IsUnique()
                .HasDatabaseName("UX_ClassYear_Name_Year");

            builder.HasIndex(x => new { x.SchoolYear, x.HomeRoomId })
                .IsUnique();
        }
    }
}

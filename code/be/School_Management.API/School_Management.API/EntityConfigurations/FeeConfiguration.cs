using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class FeeConfiguration : IEntityTypeConfiguration<Fee>
    {
        public void Configure(EntityTypeBuilder<Fee> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Amount).IsRequired().HasPrecision(18,2);
            builder.Property(x => x.ClassYearId).IsRequired();
            builder.Property(x => x.DueDate).IsRequired();
            builder.Property(x => x.SchoolYear).IsRequired();
            builder.HasIndex(x => new { x.ClassYearId, x.SchoolYear, x.Title }).IsUnique();

            builder.ToTable("Fee", x =>
            {
                x.HasCheckConstraint("CK_Amount_Fee", "\"Amount\" > 0");
                x.HasCheckConstraint("CK_SchoolYear_Fee", "\"SchoolYear\" > 2000");
            });
        }
    }
}

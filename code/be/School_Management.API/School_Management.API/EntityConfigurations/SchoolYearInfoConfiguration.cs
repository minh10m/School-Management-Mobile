using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class SchoolYearInfoConfiguration : IEntityTypeConfiguration<SchoolYearInfo>
    {
        public void Configure(EntityTypeBuilder<SchoolYearInfo> builder)
        {
            builder.Property(x => x.SchoolYear).IsRequired();
            builder.Property(x => x.Term).IsRequired();
        }
    }
}

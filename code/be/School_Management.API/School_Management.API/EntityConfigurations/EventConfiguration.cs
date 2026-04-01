using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.Property(x => x.Title)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(x => x.Body)
                   .IsRequired()
                   .HasMaxLength(3000);

            builder.Property(x => x.StartTime)
                   .IsRequired();

            builder.Property(x => x.FinishTime)
                   .IsRequired();

            builder.Property(x => x.SchoolYear)
                   .IsRequired();

            builder.Property(x => x.Term)
                   .IsRequired();

            builder.HasIndex(x => new { x.Title, x.StartTime})
                    .IsUnique();

            builder.ToTable("Events", x =>
            {
                x.HasCheckConstraint(
                    "CK_StartTime_FinishTime", " \"StartTime\" < \"FinishTime\""
                );
                x.HasCheckConstraint(
                    "CK_SchoolYear", " \"SchoolYear\" >= 2000 AND \"SchoolYear\" <= 2100"
                );

                x.HasCheckConstraint(
                "CK_Term", " \"Term\" >= 1 AND \"Term\" <= 2"
                );
            });

        }
    }
}


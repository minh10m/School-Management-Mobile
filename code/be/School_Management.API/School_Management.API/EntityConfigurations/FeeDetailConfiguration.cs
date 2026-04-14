using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class FeeDetailConfiguration : IEntityTypeConfiguration<FeeDetail>
    {
        public void Configure(EntityTypeBuilder<FeeDetail> builder)
        {
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.Status).IsRequired().HasMaxLength(30);
            builder.Property(x => x.AmountDue).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.AmountPaid).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.Reason).IsRequired().HasMaxLength(200);
            builder.HasIndex(x => x.StudentId);
            builder.Property(x => x.SchoolYear).IsRequired();
            builder.HasIndex(x => x.FeeId);

            builder.ToTable("FeeDetail", t =>
            {
                t.HasCheckConstraint("CK_AmountDue_Positive", "\"AmountDue\" >= 0");
                t.HasCheckConstraint("CK_AmountPaid_NotNegative", "\"AmountPaid\" >= 0");
                t.HasCheckConstraint("CK_Amount_FeeDetail", "\"AmountPaid\" <= \"AmountDue\"");
            });
        }
    }
}

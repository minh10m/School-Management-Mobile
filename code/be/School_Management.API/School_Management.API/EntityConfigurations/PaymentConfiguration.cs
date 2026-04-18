using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasIndex(x => x.TransactionId).IsUnique().HasFilter("\"TransactionId\" IS NOT NULL");
            builder.HasIndex(x => x.OrderCode).IsUnique();
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.UserId).IsRequired();
            builder.Property(x => x.Amount).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.ActualAmount).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.OrderCode).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Type).IsRequired().HasMaxLength(30);
            builder.Property(x => x.Status).IsRequired().HasMaxLength(50);
            builder.Property(x => x.Description).IsRequired().HasMaxLength(250);
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.ToTable(x => x.HasCheckConstraint("CK_Amount_Payment", "\"Amount\" >= 0 AND \"ActualAmount\" >= 0"));

        }
    }
}

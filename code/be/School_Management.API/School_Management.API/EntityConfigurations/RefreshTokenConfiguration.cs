using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {

        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.Property(x => x.TokenHash)
                .HasMaxLength(512)
                .IsRequired();

            builder.HasIndex(x => x.TokenHash)
                .IsUnique();

            builder.Property(x => x.IsRevoked)
                .HasDefaultValue(false);

            builder.Property(x => x.CreatedAt)
                .HasDefaultValueSql("now()");

            builder.Property(x => x.ReplacedByToken)
                .HasMaxLength(512);

            builder.ToTable(t => t.HasCheckConstraint
            ("CK_RefreshToken_Expiration", "\"ExpiresAt\" > \"CreatedAt\""));

        }
    }
}

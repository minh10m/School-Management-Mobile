using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class ResultConfiguration : IEntityTypeConfiguration<Result>
    {
        public void Configure(EntityTypeBuilder<Result> builder)
        {
            builder.Property(x => x.Type).HasMaxLength(70).IsRequired();
            builder.Property(x => x.Value).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.SubjectId).IsRequired();
            builder.Property(x => x.Term).IsRequired();
            builder.Property(x => x.Weight).IsRequired();
            builder.Property(x => x.SchoolYear).IsRequired();


            builder.ToTable("Result", x =>
            {
                x.HasCheckConstraint("CK_Value_Result", "\"Value\" >= 0 AND \"Value\" <= 10");
                x.HasCheckConstraint("CK_Term_Result", "\"Term\" >= 1 AND \"Term\" <= 2");
                x.HasCheckConstraint("CK_Weight_Result", "\"Weight\" >= 1 AND \"Weight\" <= 3");
                x.HasCheckConstraint("CK_SchoolYear_Result", "\"SchoolYear\" > 2000 AND \"SchoolYear\" < 2100");
                x.HasCheckConstraint("CK_Type_Result", "\"Type\" IN ('Miệng', '15 phút', 'Giữa kì', 'Cuối kì')");
            });

            builder.HasIndex(x => new { x.StudentId, x.SubjectId, x.Type, x.Term, x.SchoolYear }).IsUnique();
        }
    }
}

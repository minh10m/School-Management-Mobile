using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using School_Management.API.Models.Domain;

namespace School_Management.API.EntityConfigurations
{
    public class SubmissionConfiguration : IEntityTypeConfiguration<Submission>
    {
        public void Configure(EntityTypeBuilder<Submission> builder)
        {
            builder.Property(x => x.AssignmentId).IsRequired();
            builder.Property(x => x.StudentId).IsRequired();
            builder.Property(x => x.FileTitle).HasMaxLength(250);
            builder.Property(x => x.FileUrl).HasMaxLength(2048);
            builder.Property(x => x.TimeSubmit).IsRequired();
            builder.Property(x => x.Status).HasMaxLength(30);
            builder.Property(x => x.PublicId).IsRequired();

        }
    }
}

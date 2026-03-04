using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Models.Domain;

namespace School_Management.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<AppUser>().ToTable("User");
            builder.Entity<IdentityRole<Guid>>().ToTable("Role");
            builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRole");

            Guid adminId = new Guid("ef18be90-de43-45db-9c63-8778ff21e786");
            Guid teacherId = new Guid ("ddfd9f1c-e824-4dd3-9859-5e12d419145f");
            Guid studentId = new Guid ("88ad671c-a2bc-4d35-85c6-02f42bfb3a0c");

            var roles = new List<IdentityRole<Guid>>
            {
                new IdentityRole<Guid>
                {
                    Id = adminId,
                    ConcurrencyStamp = adminId.ToString(),
                    Name = "Admin",
                    NormalizedName = "Admin".ToUpper()
                },

                new IdentityRole<Guid>
                {
                    Id = teacherId,
                    ConcurrencyStamp = teacherId.ToString(),
                    Name = "Teacher",
                    NormalizedName = "Teacher".ToUpper()
                },

                new IdentityRole<Guid>
                {
                    Id = studentId,
                    ConcurrencyStamp = studentId.ToString(),
                    Name = "Student",
                    NormalizedName = "Student".ToUpper()
                }
            };

            builder.Entity<IdentityRole<Guid>>().HasData(roles);
        }
    }
}

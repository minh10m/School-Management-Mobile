using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Models.Domain;
using System.Reflection.Emit;

namespace School_Management.API.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }

        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Teacher> Teacher { get; set; }
        public DbSet<Student> Student { get; set; }
        public DbSet<ClassYear> ClassYear { get; set; }
        public DbSet<StudentClassYear> StudentClassYear { get; set; }
        public DbSet<TeacherSubject> TeacherSubject { get; set; }
        public DbSet<Subject> Subject { get; set; }
        public DbSet<Schedule> Schedule { get; set; }
        public DbSet<ScheduleDetail> ScheduleDetail { get; set; }

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
            

            // Configure datetime datatype with timestamp without time zone
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                var properties = entityType.GetProperties()
                    .Where(p => p.ClrType == typeof(DateTime) || p.ClrType == typeof(DateTime?));

                foreach (var property in properties)
                {
                    property.SetColumnType("timestamp with time zone");
                }
            }

            builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }
    }
}

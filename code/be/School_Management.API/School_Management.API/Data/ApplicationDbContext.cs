using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Models.Domain;
using System.Linq.Expressions;
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
        public DbSet<Attendance> Attendance { get; set; }
        public DbSet<Event> Event { get; set; }
        public DbSet<Assignment> Assignment { get; set; }
        public DbSet<Submission> Submission { get; set; }
        public DbSet<Result> Result { get; set; }
        public DbSet<ExamSchedule> ExamSchedule { get; set; }
        public DbSet<ExamScheduleDetail> ExamScheduleDetail { get; set; }
        public DbSet<ExamStudentAssignment> ExamStudentAssignment { get; set; }
        public DbSet<Lesson> Lesson { get; set; }
        public DbSet<Course> Course { get; set; }
        public DbSet<LessonVideo> LessonVideo { get; set; }
        public DbSet<LessonAssignment> LessonAssignment { get; set; }
        public DbSet<Fee> Fee { get; set; }
        public DbSet<FeeDetail> FeeDetail { get; set; }
        public DbSet<SchoolYearInfo> SchoolYearInfo { get; set; }
        public DbSet<Payment> Payment { get; set; }
        public DbSet<EnrollCourse> EnrollCourse { get; set; }
        public DbSet<AIChatHistory> AIChatHistory { get; set; }
        public DbSet<KnowledgeBase> KnowledgeBase { get; set; }
        public DbSet<Conversation> Conversation { get; set; }
        public DbSet<UserConversation> UserConversation { get; set; }
        public DbSet<Message> Message { get; set; }
        public DbSet<Notification> Notification { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
            builder.Entity<AppUser>().ToTable("User");
            builder.Entity<IdentityRole<Guid>>().ToTable("Role");
            builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRole");
            builder.Entity<LessonAssignment>().ToTable("LessonAssignment");
            builder.HasPostgresExtension("vector");

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

            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                // Kiểm tra xem thực thể có triển khai ISoftDelete hay không
                if (typeof(ISoftDelete).IsAssignableFrom(entityType.ClrType))
                {
                    var param = Expression.Parameter(entityType.ClrType, "e");
                    var prop = Expression.Property(param, nameof(ISoftDelete.IsDeleted));
                    var falseConstant = Expression.Constant(false);
                    var comparison = Expression.Equal(prop, falseConstant);
                    var lambda = Expression.Lambda(comparison, param);

                    builder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }


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

        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Quét qua các thực thể đang có trạng thái chuẩn bị bị xóa và có dán nhãn ISoftDelete
            foreach (var entry in ChangeTracker.Entries<ISoftDelete>())
            {
                if (entry.State == EntityState.Deleted)
                {
                    entry.State = EntityState.Modified; // Chuyển sang trạng thái chỉnh sửa
                    entry.Entity.IsDeleted = true;      // Đánh dấu xóa mềm
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}

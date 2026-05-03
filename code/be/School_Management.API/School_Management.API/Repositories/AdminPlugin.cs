using Azure.Core;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.ComponentModel;

namespace School_Management.API.Repositories
{
    public class AdminPlugin
    {
        private readonly string role;
        private readonly Guid userId;
        private readonly ApplicationDbContext context;
        private readonly UserManager<AppUser> userManager;
        private readonly RoleManager<IdentityRole<Guid>> roleManager;

        public AdminPlugin(string role, Guid userId, ApplicationDbContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        {
            this.role = role;
            this.userId = userId;
            this.context = context;
            this.userManager = userManager;
            this.roleManager = roleManager;
        }

        //LẤY DANH SÁCH SỰ KIỆN CHO ADMIN 
        [KernelFunction]
        [Description("Lấy thông tin sự kiện diễn ra ở trường, yêu cầu cung cấp năm học bắt đầu và kì học")]
        public async Task<List<object>> GetAllEvent
        (
            [Description("Năm học bắt đầu, là điều kiện lọc không bắt buộc nếu năm 2026-2027 thì lấy giá trị là 2026")]
            int? SchoolYear = null,

            [Description("Học kì.Bắt buộc phải có")]
            int? Term = null,

            [Description("Tiêu đề sự kiện, nếu có giá trị thì là điều kiện lọc, không có thì lấy tất cả")]
            string? Title = null,

            [Description("Nội dung mô tả chi tiết sự kiện, là điều kiện lọc, không có lấy tất cả")]
            string? Body = null
        )
        {
            var query = context.Event.AsNoTracking()
                                     .Where(x => x.SchoolYear == SchoolYear
                                           && x.Term == Term);

            //Filtering
            if (!string.IsNullOrWhiteSpace(Title))
            {
                var title = Title.Trim().ToLower();
                query = query.Where(x => x.Title.ToLower().Contains(title));
            }
            if (!string.IsNullOrWhiteSpace(Body))
            {
                var body = Body.Trim().ToLower();
                query = query.Where(x => x.Body.ToLower().Contains(body));
            }


            //Sorting
            query = query.OrderByDescending(x => x.EventDate).ThenByDescending(x => x.StartTime);


            var listEvents = await query
                .Take(50)
                .Select(x => new EventResponse
                {
                    Body = x.Body,
                    SchoolYear = x.SchoolYear,
                    StartTime = x.StartTime,
                    Term = x.Term,
                    EventDate = x.EventDate,
                    FinishTime = x.FinishTime,
                    Title = x.Title
                }).ToListAsync();

            return listEvents.Cast<object>().ToList();
        }

        // LẤY DANH SÁCH NGƯỜI DÙNG TRONG HỆ THỐNG
        [KernelFunction]
        [Description("Lấy danh sách người dùng trong hệ thống, nếu hỏi số lượng tự động đếm và trả lời nha")]
        public async Task<List<UserListResponse>> GetAllUser
        (
            [Description("Tên người dùng, điều kiện lọc, không bắt buộc")]
            string? FullName = null,
            [Description("Email người dùng, điều kiện lọc, không bắt buộc")]
            string? Email = null,
            [Description("Địa chỉ người dùng, điều kiện lọc, không bắt buộc")]
            string? Address = null,
            [Description("Vai trò người dùng (Admin, giáo viên, học sinh), điều kiện lọc, không bắt buộc")]
            string? Role = null )
        {
            var query = from user in context.Users
                        join userRole in context.UserRoles on user.Id equals userRole.UserId into ur
                        from userRole in ur.DefaultIfEmpty()
                        join role in context.Roles on userRole.RoleId equals role.Id into r
                        from role in r.DefaultIfEmpty()
                        select new { user, roleName = role.Name };

            // 2. Filtering
            if (!string.IsNullOrWhiteSpace(FullName))
                query = query.Where(x => x.user.FullName.Contains(FullName));

            if (!string.IsNullOrWhiteSpace(Email))
                query = query.Where(x => x.user.Email.Contains(Email));

            if (!string.IsNullOrWhiteSpace(Address))
                query = query.Where(x => x.user.Address.Contains(Address));

            if (!string.IsNullOrWhiteSpace(Role))
            {
                query = query.Where(x => x.roleName.ToLower() == Role.ToLower());
            }

            query = query.OrderBy(x => x.user.FullName);

            var items = await query
                .Select(x => new UserListResponse
                {
                    UserId = x.user.Id,
                    UserName = x.user.UserName,
                    FullName = x.user.FullName,
                    LockoutEnd = x.user.LockoutEnd,
                    Role = x.roleName,
                    CreatedAt = x.user.CreatedAt
                })
                .ToListAsync();

            return items;
        }

        //LẤY DANH SÁCH VAI TRÒ 
        [KernelFunction]
        [Description("Lấy danh sách vai trò (role) của hệ thống")]
        public async Task<List<RoleInfoResponse>> GetAllRoles
        (
            [Description("Tên vai trò (admin, giáo viên, học sinh) , điều kiện lọc, không bắt buộc")]
            string? Name = null
         )
        {
            var query = roleManager.Roles.AsQueryable();

            //filtering
            if (!string.IsNullOrWhiteSpace(Name))
                query = query.Where(x => x.Name.ToLower().Contains(Name.Trim().ToLower()));


            //sorting
            query = query.OrderBy(x => x.Name);

            
            var result = await query.Take(50).Select(g => new RoleInfoResponse
            {
                Name = g.Name,
                NormalizedName = g.NormalizedName,
                RoleId = g.Id
            }).ToListAsync();

            return result;

        }

        //LẤY DANH SÁCH HỌC SINH
        [KernelFunction]
        [Description("Lấy danh sách học sinh của trường học")]
        public async Task<List<StudentListResponse>> GetAllStudent
        (
            [Description("Tên học sinh, điều kiện lọc, không bắt buộc")]
            string? FullName = null,

            [Description("Tên lớp học, điều kiện lọc, không bắt buộc")]
            string? ClassName = null,

            [Description("Khối lớp, điều kiện lọc không bắt buộc")]
            int? Grade = null
        )
        {
            var query = context.Student.AsQueryable();

            if (!string.IsNullOrWhiteSpace(FullName))
                query = query.Where(x => x.User.FullName.ToLower().Contains(FullName.ToLower()));

            if (!string.IsNullOrWhiteSpace(ClassName) || Grade.HasValue)
            {
                query = query.Where(s => s.StudentClassYears
                    .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                    .Take(1)
                    .Any(latest =>
                        (string.IsNullOrWhiteSpace(ClassName) || latest.ClassYear.ClassName.ToLower().Contains(ClassName.ToLower())) &&
                        (Grade == null || latest.ClassYear.Grade == Grade)
                    ));
            }

            //Sorting
            query = query.OrderBy(x => x.User.FullName);
                  


            var ListStudent = await query
                .Take(50)
                .Select(x => new StudentListResponse
                {
                    FullName = x.User.FullName,
                    ClassName = x.StudentClassYears
                             .OrderByDescending(x => x.ClassYear.SchoolYear)
                             .Select(x => x.ClassYear.ClassName)
                             .FirstOrDefault(),
                    Grade = x.StudentClassYears
                             .OrderByDescending(x => x.ClassYear.SchoolYear)
                             .Select(x => x.ClassYear.Grade)
                             .FirstOrDefault()

                }).ToListAsync();

            return ListStudent;

        }

        //LẤY DANH SÁCH GIÁO VIÊN
        [KernelFunction]
        [Description("Lấy danh sách giáo viên trong trường học")]
        public async Task<List<TeacherListResponse>> GetAllTeacher
        (
            [Description("Tên giáo viên, điều kiện lọc không bắt buộc")]
            string? FullName = null,

            [Description("Tên môn học, điều kiện lọc không bắt buộc")]
            string? SubjectName = null
        )
        {
            var query = context.Teacher.AsQueryable();

            //filtering
            if (!string.IsNullOrWhiteSpace(FullName))
                query = query.Where(x => x.User.FullName.ToLower().Contains(FullName.ToLower()));

            if (!string.IsNullOrWhiteSpace(SubjectName))
                query = query.Where(x => x.TeacherSubjects.Any(ts => ts.Subject.SubjectName.ToLower().Contains(SubjectName.ToLower())));


            //sorting
           query = query.OrderBy(x => x.User.FullName);

            var ListTeachers = await query
                .Take(50)
                .Select(x => new TeacherListResponse
                {
                    TeacherId = x.Id,
                    FullName = x.User.FullName,
                    UserId = x.User.Id,
                    SubjectNames = x.TeacherSubjects
                               .Select(x => x.Subject.SubjectName)
                               .ToList()

                }).ToListAsync();

            return ListTeachers;
        }

        //LẤY DANH SÁCH LỚP HỌC
        [KernelFunction]
        [Description("Lấy danh sách lớp học trong trường")]
        public async Task<List<ClassYearResponse>> GetAllClass
        (
            [Description("Tên lớp, điều kiện lọc không bắt buộc")]
            string? ClassName = null,

            [Description("Năm học bắt đầu, là điều kiện lọc không bắt buộc nếu năm 2026-2027 thì lấy giá trị là 2026")]
            int? SchoolYear = null,

            [Description("Khối lớp, điều kiện lọc không bắt buộc")]
            int? Grade = null

        )
        {
            var query = context.ClassYear.AsNoTracking()
                                         .Include(x => x.Teacher)
                                         .ThenInclude(t => t.User)
                                         .AsQueryable();


            //Filtering
            if (!string.IsNullOrWhiteSpace(ClassName))
            {
                var name = ClassName.Trim().ToLower();
                query = query.Where(x => x.ClassName.ToLower().Contains(name));
            }
            if (SchoolYear.HasValue)
                query = query.Where(x => x.SchoolYear == SchoolYear);
            if (Grade.HasValue)
                query = query.Where(x => x.Grade == Grade);

            //Sorting
            query = query.OrderBy(x => x.ClassName);
            var listClassYear = await query.Take(50).Select(x => new ClassYearResponse
            {
                ClassName = x.ClassName,
                ClassYearId = x.Id,
                Grade = x.Grade,
                SchoolYear = x.SchoolYear,
                HomeRoomName = x.Teacher.User.FullName,
                StudentCount = x.StudentClassYears.Count()

            }).ToListAsync();


            return listClassYear;
        }

        //LẤY DANH SÁCH MÔN HỌC
        [KernelFunction]
        [Description("Lấy danh sách môn học trong trường")]
        public async Task<List<SubjectResponse>> GetAllSubject
        (
            [Description("Tên môn học, điều kiện lọc không bắt buộc")]
            string? SubjectName = null,

            [Description("Số tiết của môn đó trong tuần, điều kiện lọc không bắt buộc")]
            int? MaxPeriod = null
        )
        {
            var query = context.Subject.AsNoTracking().AsQueryable();

            //Filtering
            if (!string.IsNullOrWhiteSpace(SubjectName))
                query = query.Where(x => x.SubjectName.ToLower().Contains(SubjectName.ToLower()));
            if (MaxPeriod.HasValue)
                query = query.Where(x => x.MaxPeriod == MaxPeriod);

            //Sorting
            query = query.OrderBy(x => x.SubjectName);
               

            var subjectList = await query.Take(50).Select(x => new SubjectResponse
            {
                SubjectId = x.Id,
                MaxPeriod = x.MaxPeriod,
                SubjectName = x.SubjectName
            }).ToListAsync();
            return subjectList;
        }

        //LẤY DANH SÁCH KHÓA HỌC CHO ADMIN
        [KernelFunction]
        [Description("Lấy danh sách tất cả khóa học có trong hệ thống")]
        public async Task<List<CourseResponse>> GetAllCourseForAdmin
        (
            [Description("Trạng thái khóa học (hệ thống gồm 3 giá trị approved, rejected, pending, người dùng sẽ truyền vào là đã duyệt, từ chối hoặc chờ duyệt), điều kiện lọc, không bắt buộc")]
            string? Status = null,

            [Description("Tên khóa học, điều kiện lọc, không bắt buộc")]
            string? CourseName = null,

            [Description("Giá tiền mà người dùng truyền vào khi muốn lấy danh sách khóa học có số tiền lớn hơn hoặc bằng giá tiền này, điều kiện lọc, không bắt buộc")]
            decimal? MinPrice = null,

            [Description("Giá tiền mà người dùng truyền vào khi muốn lấy danh sách khóa học có số tiền nhỏ hơn hoặc bằng giá tiền này, điều kiện lọc, không bắt buộc")]
            decimal? MaxPrice = null
        )
        {
            var query = context.Course.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(CourseName))
            {
                var name = CourseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(Status))
            {
                var name = Status.Trim().ToLower();
                query = query.Where(x => x.Status.Trim().ToLower().Contains(name));
            }

            if (MinPrice.HasValue)
            {
                query = query.Where(x => x.Price >= MinPrice.Value);
            }

            if (MaxPrice.HasValue)
            {
                query = query.Where(x => x.Price <= MaxPrice.Value);
            }

            if (Status == "Approved")
                query = query.OrderByDescending(x => x.PublishedAt);
            else
                query = query.OrderByDescending(x => x.CreatedAt);

            var listResult = await query.Take(50).Select(g => new CourseResponse
            {
                CourseName = g.CourseName,
                CreatedAt = g.CreatedAt,
                Description = g.Description,
                Price = g.Price,
                PublishedAt = g.PublishedAt,
                Status = g.Status,
                SubjectName = g.TeacherSubject.Subject.SubjectName,
                TeacherName = g.TeacherSubject.Teacher.User.FullName
            }).ToListAsync();


            return listResult;

        }

        //LẤY DANH SÁCH LỊCH HỌC
        [KernelFunction]
        [Description("Lấy danh sách lịch học hiện có trong hệ thống")]
        public async Task<List<ScheduleResponse>> GetAllScheduleForAdmin
        (

            [Description("Kì học, là điều kiện lọc không bắt buộc")]
            int? Term = null,

            [Description("Năm học bắt đầu, là điều kiện lọc không bắt buộc nếu năm 2026-2027 thì lấy giá trị là 2026")]
            int? SchoolYear = null,

            [Description("Trạng thái của lịch học, nếu true thì là lịch đang được sử dụng, false thì là đang chưa được sử dụng, điều kiện lọc không bắt buộc (nếu người dùng bảo lịch đang được sử dụng giá trị là true, nếu ko được sử dụng giá trị là false nhé)")]
            bool? IsActive = null
        )
        {
            var query = context.Schedule.AsQueryable();

            //filtering
            if (SchoolYear.HasValue)
                query = query.Where(x => x.SchoolYear == SchoolYear);
            if (Term.HasValue)
                query = query.Where(x => x.Term == Term);
            if (IsActive.HasValue)
                query = query.Where(x => x.IsActive == IsActive);

            //sorting
            query = query.OrderBy(x => x.Name);

            var scheduleList = await query
                                    .AsNoTracking().Take(50)
                                    .Select(x => new ScheduleResponse
                                    {
                                        SchoolYear = x.SchoolYear,
                                        ClassName = x.ClassYear.ClassName,
                                        IsActive = x.IsActive,
                                        Name = x.Name,
                                        Term = x.Term
                                    }).ToListAsync();

            return scheduleList;
                
        }

        //LẤY DANH SÁCH LỊCH THI
        [KernelFunction]
        [Description("Lấy danh sách lịch thi đang có trong hệ thống nhà trường")]
        public async Task<List<ExamScheduleResponse>> GetAllExamSchedule
        (
            [Description("Học kì, điều kiện lọc không bắt buộc")]
            int? Term = null,

            [Description("Năm học bắt đầu, là điều kiện lọc không bắt buộc nếu năm 2026-2027 thì lấy giá trị là 2026")]
            int? SchoolYear = null,

            [Description("Tiêu đề lịch thi (Tên lịch), điều kiện lọc không bắt buộc")]
            string? Title = null,

            [Description("Loại lịch thi (giữa kì hoặc cuối kì) điều kiện lọc không bắt buộc")]
            string? Type = null,

            [Description("Trạng thái của lịch thi, nếu true thì là lịch đang hoạt động, false thì là đang không hoạt động, điều kiện lọc không bắt buộc (nếu người dùng bảo lịch đang được sử dụng giá trị là true, nếu ko được sử dụng giá trị là false nhé)")]
            bool? IsActive = null
        )
        {
            var query = context.ExamSchedule.AsNoTracking().AsQueryable();

            if (SchoolYear.HasValue && SchoolYear > 0)
            {
                query = query.Where(x => x.SchoolYear == SchoolYear.Value);
            }

            if (Term.HasValue && Term > 0)
            {
                query = query.Where(x => x.Term == Term.Value);
            }

            if (!string.IsNullOrWhiteSpace(Type))
            {
                var type = Type.Trim().ToLower();
                query = query.Where(x => x.Type.ToLower().Contains(type));
            }

            if (IsActive.HasValue)
            {
                query = query.Where(x => x.IsActive == IsActive.Value);
            }

            if (!string.IsNullOrWhiteSpace(Title))
            {
                var name = Title.Trim().ToLower();
                query = query.Where(x => x.Title.Trim().ToLower().Contains(name));
            }

            query = query.OrderBy(x => x.Id);

            var listResult = await query.Take(50).Select(g => new ExamScheduleResponse
            {
                ExamScheduleId = g.Id,
                SchoolYear = g.SchoolYear,
                Grade = g.Grade,
                Title = g.Title,
                IsActive = g.IsActive,
                Term = g.Term,
                Type = g.Type,
            }).ToListAsync();

            return listResult;
        }

        //LẤY DANH SÁCH HỌC PHÍ CỦA HỆ THỐNG 
        [KernelFunction]
        [Description("Lấy danh sách học phí của hệ thống trong năm học, yêu cầu cung cấp năm học")]
        public async Task<List<FeeResponse>> GetAllFee
        (

            [Description("Năm học bắt đầu, là điều kiện lọc bắt buộc phải có, nếu năm 2026-2027 thì lấy giá trị là 2026")]
            int? SchoolYear = null
        )
        {
            var query = context.Fee.AsNoTracking().AsQueryable();
            query = query.Where(x => x.SchoolYear == SchoolYear);
            query = query.OrderBy(x => x.Title);

            var listResult = await query.Take(50).Select(fee => new FeeResponse
            {
                Id = fee.Id,
                DueDate = fee.DueDate,
                Amount = fee.Amount,
                ClassYearId = fee.ClassYearId,
                SchoolYear = fee.SchoolYear,
                Title = fee.Title,
                ClassName = fee.ClassYear.ClassName ?? ""
            }).ToListAsync();


            return listResult;
        }
    }


}

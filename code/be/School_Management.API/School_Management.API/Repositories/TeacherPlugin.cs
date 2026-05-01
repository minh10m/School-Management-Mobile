using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Embeddings;
using Pgvector.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using System.ComponentModel;
using System.Security.Claims;

namespace School_Management.API.Repositories
{
    public class TeacherPlugin
    {
        private readonly string role;
        private readonly Guid userId;
        private readonly ApplicationDbContext context;
        private readonly IScheduleRepository scheduleRepository;
        private readonly ITeacherRepository teacherRepository;
        private readonly Kernel kernel;

        public TeacherPlugin(string role, Guid userId, ApplicationDbContext context, IScheduleRepository scheduleRepository, ITeacherRepository teacherRepository, Kernel kernel)
        {
            this.role = role;
            this.userId = userId;
            this.context = context;
            this.scheduleRepository = scheduleRepository;
            this.teacherRepository = teacherRepository;
            this.kernel = kernel;
        }

        //LẤY DANH SÁCH LỊCH DẠY CHO GIÁO VIÊN
        [KernelFunction]
        [Description("Lấy danh sách lịch dạy của giáo viên trong năm học trong kì, yêu cầu phải có năm học bắt đầu và kì học")]
        public async Task<List<TeacherScheduleDetailResponse>> GetMyScheduleForTeacher
        (   
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")]
            int? Term = null,

            [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
            int? SchoolYear = null)
        {

            var teacherId = await teacherRepository.GetTeacherIdByUserId(userId);
            if (teacherId == Guid.Empty) return new List<TeacherScheduleDetailResponse>();

            var ScheduleDetailList = await context.ScheduleDetail
                                                  .AsNoTracking()
                                                  .Where(x => x.Schedule.IsActive == true
                                                  && x.Schedule.SchoolYear == SchoolYear
                                                  && x.Schedule.Term == Term
                                                  && x.TeacherSubject.TeacherId == teacherId)
                                                  .Select(g => new TeacherScheduleDetailResponse
                                                  {
                                                      DayOfWeek = g.DayOfWeek,
                                                      FinishTime = g.FinishTime,
                                                      StartTime = g.StartTime,
                                                      SubjectName = g.TeacherSubject.Subject.SubjectName,
                                                      ClassName = g.Schedule.ClassYear.ClassName
                                                  })
                                                  .OrderBy(x => x.DayOfWeek)
                                                  .ThenBy(x => x.StartTime)
                                                  .ToListAsync();
            foreach (var item in ScheduleDetailList)
            {
                item.DayOfWeekVietNamese = scheduleRepository.GetVietNameseDay(item.DayOfWeek);
            }
            return ScheduleDetailList;
        }

        //LẤY DANH SÁCH KHÓA HỌC CỦA GIÁO VIÊN ĐÓ
        [KernelFunction]
        [Description("Lấy danh sách khóa học của giáo viên đó")]
        public async Task<List<CourseResponse>> GetMyCourseForTeacher
        (
            [Description("Tên khóa học, không bắt buộc, điều kiện lọc. Nếu không có lấy hết")]
            string? courseName = null
        )
        {
            var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId)
                                                     .Select(g => g.Id)
                                                     .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) return new List<CourseResponse>();

            var query = context.Course.AsNoTracking()
                                      .Where(x => x.TeacherSubject.TeacherId == teacherId)
                                      .AsQueryable();
            if (!string.IsNullOrWhiteSpace(courseName))
            {
                var name = courseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            query = query.OrderByDescending(x => x.CreatedAt);

            var listResult = await query.Take(50)
                                        .Select(g => new CourseResponse
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

        //LẤY DANH SÁCH LỊCH COI THI CHO GIÁO VIÊN
        [KernelFunction]
        [Description("Lấy lịch coi thi của giáo viên, yêu cầu cung cấp loại lịch (Cuối kì hoặc Giữa kì), năm học và học kì")]
        public async Task<List<MyExamScheduleDetailResponse>> GetMyExamSchedule
        (   
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")]
            int? Term = null,

            [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
            int? SchoolYear = null,

            [Description("Loại lịch (Cuối kì hoặc Giữa kì), bắt buộc phải có")]
            string? Type = null
        )
        {

                var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId).Select(g => g.Id).FirstOrDefaultAsync();
                if (teacherId == Guid.Empty) return new List<MyExamScheduleDetailResponse>();

                var listResult = await context.ExamScheduleDetail.AsNoTracking()
                                                                 .Where(x => x.ExamSchedule.Type == Type && x.ExamSchedule.Term == Term
                                                                          && x.ExamSchedule.SchoolYear == SchoolYear && x.ExamSchedule.IsActive == true
                                                                          && x.TeacherId == teacherId)
                                                                 .OrderBy(x => x.Date).ThenBy(x => x.StartTime)
                                                                 .Select(g => new MyExamScheduleDetailResponse
                                                                 {
                                                                     StartTime = g.StartTime,
                                                                     Date = g.Date,
                                                                     FinishTime = g.FinishTime,
                                                                     RoomName = g.RoomName,
                                                                     SubjectName = g.Subject.SubjectName ?? "",
                                                                 }).ToListAsync();

            return listResult;
        }

        //LẤY SỰ KIỆN CHO GIÁO VIÊN
        [KernelFunction]
        [Description("Lấy thông tin sự kiện diễn ra ở trường, yêu cầu cung cấp năm học bắt đầu và kì học")]
        public async Task<List<object>> GetAllEvent
        (
            [Description("Năm học bắt đầu. Bắt buộc phải có")]
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

        //LẤY DANH SÁCH GIÁO VIÊN ĐỒNG NGHIỆP
        [KernelFunction]
        [Description("Lấy danh sách giáo viên là đồng nghiệp của giáo viên này")]
        public async Task<List<TeacherListResponse>> GetAllTeacher
        (
            [Description("Tên giáo viên, không bắt buộc, điều kiện lọc")]
            string? FullName = null,

            [Description("Tên môn học, không bắt buộc, điều kiện lọc")]
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
                    FullName = x.User.FullName,
                    SubjectNames = x.TeacherSubjects
                               .Select(x => x.Subject.SubjectName)
                               .ToList()

                }).ToListAsync();

            return ListTeachers;
        }
    }
}

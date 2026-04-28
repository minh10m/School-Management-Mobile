using Azure.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using System.ComponentModel;

namespace School_Management.API.Repositories
{
    public class StudentPlugin
    {
        private readonly string role;
        private readonly Guid userId;
        private readonly ApplicationDbContext context;
        private readonly IStudentRepository studentRepository;
        private readonly IScheduleRepository scheduleRepository;

        public StudentPlugin(string role, Guid userId, ApplicationDbContext context, IStudentRepository studentRepository, IScheduleRepository scheduleRepository)
        {
            this.role = role;
            this.userId = userId;
            this.context = context;
            this.studentRepository = studentRepository;
            this.scheduleRepository = scheduleRepository;
        }

        //LỊCH THI
        [KernelFunction]
        [Description("Lấy danh sách lịch thi cho học sinh. Yêu cầu đầy đủ loại lịch, học kỳ và năm học.")]
        public async Task<List<object>> GetMyExamSchedule(
                    [Description("Loại lịch thi (Giữa kì hoặc Cuối kì). Bắt buộc phải có.")]
                    string Type = "",   

                    [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")]
                    int? Term = null,

                    [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
                    int? SchoolYear = null
        )
        {
            if (string.IsNullOrEmpty(Type) || Term == null || SchoolYear == null)
            {
                return new List<object> { }; // AI sẽ tự hỏi lại dựa trên System Prompt
            }

            var studentId = await context.Student.AsNoTracking()
                                 .Where(x => x.UserId == userId)
                                 .Select(g => g.Id)
                                 .FirstOrDefaultAsync();

            if (studentId == Guid.Empty) return new List<object>();

            var grade = await context.StudentClassYear.AsNoTracking()
                                      .Where(x => x.StudentId == studentId && x.ClassYear.SchoolYear == SchoolYear)
                                      .Select(g => g.ClassYear.Grade)
                                      .FirstOrDefaultAsync();

            var listResult = await context.ExamStudentAssignment.AsNoTracking()
                .Where(x => x.ExamScheduleDetail.ExamSchedule.Type == Type &&
                            x.ExamScheduleDetail.ExamSchedule.Term == Term &&
                            x.ExamScheduleDetail.ExamSchedule.SchoolYear == SchoolYear &&
                            x.ExamScheduleDetail.ExamSchedule.IsActive == true &&
                            x.ExamScheduleDetail.ExamSchedule.Grade == grade &&
                            x.StudentId == studentId)
                .OrderBy(x => x.ExamScheduleDetail.Date)
                .ThenBy(x => x.ExamScheduleDetail.StartTime)
                .Select(g => new MyExamScheduleDetailResponse
                {
                    StartTime = g.ExamScheduleDetail.StartTime,
                    Date = g.ExamScheduleDetail.Date,
                    FinishTime = g.ExamScheduleDetail.FinishTime,
                    RoomName = g.ExamScheduleDetail.RoomName,
                    SubjectName = g.ExamScheduleDetail.Subject.SubjectName,
                    TeacherName = g.ExamScheduleDetail.Teacher.User.FullName ?? "Chưa sắp xếp",
                    IdentificationNumber = g.IdentificationNumber
                }).ToListAsync();

            return listResult.Cast<object>().ToList();
        }

        //HỌC PHÍ LỆ PHÍ
        [KernelFunction]
        [Description("Lấy danh sách học phí và lệ phí liên quan của học sinh đang chat. Yêu cầu cung cấp năm học.")]
        public async Task<List<object>> GetAllMyFeeForStudent
        (
            [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
            int? SchoolYear = null
        )
        {
            var studentInfo = await context.Student.AsNoTracking().Where(x => x.UserId == userId).Select(g => new { g.Id, g.User.FullName }).FirstOrDefaultAsync();
            if (studentInfo == null) return new List<object>();

            var query = context.FeeDetail.AsNoTracking().Where(x => x.StudentId == studentInfo.Id && x.SchoolYear == SchoolYear).AsQueryable();

            query = query.OrderBy(x => x.Id);
            var listResult = await query.Take(50)
                                        .Select(feeDetail => new FeeDetailResponse
                                        {
                                            AmountDue = feeDetail.AmountDue,
                                            AmountPaid = feeDetail.AmountPaid,
                                            PaidAt = feeDetail.PaidAt,
                                            Reason = feeDetail.Reason,
                                            SchoolYear = feeDetail.SchoolYear,
                                            Status = feeDetail.Status,
                                            StudentName = studentInfo.FullName
                                        }).ToListAsync();

            return listResult.Cast<object>().ToList();
        }


        //SỰ KIỆN
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

        //DANH SÁCH BÀI TẬP
        [KernelFunction]
        [Description("Lấy danh sách bài tập của học sinh, yêu cầu cung cấp năm học bắt đầu, nếu trạng thái trả về null, thời gian kết thúc bài tập " +
            "nhỏ hơn thời gian hiện tại hãy hiển thị là Qúa hạn, nếu thời gian kết thúc vẫn lớn hơn hiện tại hãy hiển thị chưa nộp")]
        public async Task<List<object>> GetAllAssignment
        (
            [Description("Năm học bắt đầu. Bắt buộc phải có")]
            int? SchoolYear = null

        )
        {
            var student = await context.Student.FirstOrDefaultAsync(x => x.UserId == userId);
            if (student == null) return new List<object>();
            var classYearId = await context.StudentClassYear.AsNoTracking().Where(x => x.StudentId == student.Id && x.SchoolYear == SchoolYear)
                                                            .Select(g => g.ClassYearId).FirstOrDefaultAsync();
            var query = context.Assignment.AsNoTracking().Where(x => x.ClassYearId == classYearId);
  

            query = query.OrderByDescending(x => x.StartTime).ThenByDescending(x => x.FinishTime);

            var listAssignment = await query
                                            .Take(50)
                                            .Select(x => new AssignmentResponseForStudent
                                            {
                                                StartTime = x.StartTime,
                                                FileTitle = x.FileTitle,
                                                FileUrl = x.FileUrl,
                                                FinishTime = x.FinishTime,
                                                Description = x.Description,
                                                SubjectName = x.TeacherSubject.Subject.SubjectName,
                                                Title = x.Title,
                                                TeacherName = x.TeacherSubject.Teacher.User.FullName,
                                                Status = x.Submissions.Where(g => g.StudentId == student.Id).Select(h => h.Status).FirstOrDefault(),
                                            }).ToListAsync();

            return listAssignment.Cast<object>().ToList();
        }

        //DANH SÁCH KẾT QUẢ HỌC TẬP
        [KernelFunction]
        [Description("Lấy danh sách kết quả học tập của học sinh, yêu cầu cung cấp năm học bắt đầu và học kì")]
        public async Task<ResultForStudentResponse> GetAllResultForStudent
        (
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")]
            int? Term = null,

            [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
            int? SchoolYear = null
        )
        {
            var studentId = await context.Student.AsNoTracking()
                                                 .Where(x => x.UserId == userId)
                                                 .Select(g => g.Id)
                                                 .FirstOrDefaultAsync();
            if (studentId == Guid.Empty) return new ResultForStudentResponse();
            var myResultsList = await context.Result.Include(x => x.Subject).AsNoTracking()
                                               .Where(x => x.SchoolYear == SchoolYear
                                                        && x.Term == Term
                                                        && x.StudentId == studentId)
                                               .ToListAsync();
            var subjectResults = myResultsList.GroupBy(x => new { x.SubjectId, x.Subject.SubjectName })
                                      .Select(g => new SubjectResultR
                                      {
                                          SubjectId = g.Key.SubjectId,
                                          SubjectName = g.Key.SubjectName,
                                          AverageSubject = g.Sum(x => x.Weight) > 0 ? (float)Math.Round(g.Sum(x => x.Value * x.Weight) / g.Sum(x => x.Weight), 2) : 0,
                                          DetailResults = g.Select(x => new DetailResult
                                          {
                                              ResultId = x.Id,
                                              Type = x.Type,
                                              Value = x.Value,
                                              Weight = x.Weight
                                          }).ToList()
                                      }).ToList();

            var result = new ResultForStudentResponse
            {
                SubjectResults = subjectResults,
                Average = subjectResults.Any() ? (float)Math.Round(subjectResults.Average(x => x.AverageSubject), 2) : 0
            };

            result.Rating = result.Average switch
            {
                >= 9.0f => "Xuất sắc",
                >= 8.0f => "Giỏi",
                >= 6.5f => "Khá",
                >= 5.0f => "Trung bình",
                _ => "Yếu"
            };

            return result;
        }

        //DANH SÁCH LỊCH HỌC
        [KernelFunction]
        [Description("Lấy danh sách lịch học của học sinh ở kì học với năm học đó. Yêu cầu phải có năm học bắt đầu và kì học")]
        public async Task<List<object>> GetAllSchedule
        (
            [Description("Học kỳ (1 hoặc 2). Bắt buộc phải có.")]
            int? Term = null,

            [Description("Năm học bắt đầu (ví dụ: 2024). Bắt buộc phải có.")]
            int? SchoolYear = null
        )
        {
            var studentId = await studentRepository.GetStudentIdByUserId(userId);
            if (studentId == Guid.Empty) return new List<object>();

            var studentClassInfo = await context.ClassYear
                                                .Where(x => x.StudentClassYears.Any(sc => sc.StudentId == studentId) && x.SchoolYear == SchoolYear)
                                                .Select(x => new { x.Grade, x.ClassName })
                                                .FirstOrDefaultAsync();

            if (studentClassInfo == null) return new List<object>();

            var scheduleDetailList = await context.ScheduleDetail
                                                  .Where(x => x.Schedule.ClassYear.Grade == studentClassInfo.Grade
                                                  && x.Schedule.ClassYear.ClassName == studentClassInfo.ClassName
                                                  && x.Schedule.Term == Term
                                                  && x.Schedule.SchoolYear == SchoolYear
                                                  && x.Schedule.IsActive == true)
                                                  .Select(g => new ScheduleDetailResponse
                                                  {
                                                      StartTime = g.StartTime,
                                                      FinishTime = g.FinishTime,
                                                      TeacherName = g.TeacherSubject != null && g.TeacherSubject.Teacher != null && g.TeacherSubject.Teacher.User != null
                                                                   ? g.TeacherSubject.Teacher.User.FullName
                                                                   : "Chưa phân công",
                                                      SubjectName = g.TeacherSubject != null && g.TeacherSubject.Subject != null
                                                                   ? g.TeacherSubject.Subject.SubjectName
                                                                   : "Môn học trống",
                                                      DayOfWeek = g.DayOfWeek,
                                                  })
                                                  .OrderBy(x => x.DayOfWeek)
                                                  .ThenBy(x => x.StartTime)
                                                  .ToListAsync();

            foreach (var item in scheduleDetailList)
            {
                item.DayOfWeekVietNamese = scheduleRepository.GetVietNameseDay(item.DayOfWeek);
            }

            return scheduleDetailList.Cast<object>().ToList();
        }

        //DANH SÁCH ĐIỂM DANH
        [KernelFunction]
        [Description("lấy danh sách điểm danh của học sinh đó trong tháng trong năm, yêu cầu có tháng và năm")]
        public async Task<StudentAttendanceResponse> GetStudentAttendance
        (
            [Description("Tháng trong năm, ví dụ tháng 1, tháng 2..., bắt buộc phải có")]
            int? month = null,

            [Description("Năm, ví dụ 2025, 2026 và yêu cầu bắt buộc phải có")]
            int? year = null
        )
        {
            var studentId = await studentRepository.GetStudentIdByUserId(userId);
            if (studentId == Guid.Empty) return new StudentAttendanceResponse();
            var details = await context.Attendance
                                .AsNoTracking()
                                .Where(x => x.StudentClassYear.StudentId == studentId
                                && x.Date.Month == month && x.Date.Year == year)
                                .Select(g => new StudentAttendanceInfo
                                {
                                    Date = g.Date,
                                    Note = g.Note,
                                    Status = g.Status
                                })
                                .OrderBy(g => g.Date.Day)
                                .ToListAsync();

            var total = details.Count;
            var present = details.Count(x => x.Status == "Có mặt" || x.Status == "Đi trễ");
            var absent = details.Count(x => x.Status == "Vắng mặt");
            var percentage = (total > 0) ? ((double)present / total) * 100 : 0;

            return new StudentAttendanceResponse
            {
                Percentage = Math.Round(percentage, 1),
                TotalPresent = present,
                TotalAbsent = absent,
                StudentAttendances = details
            };
        }

        //DANH SÁCH KHÓA HỌC ĐANG CÓ TRÊN HỆ THỐNG
        [KernelFunction]
        [Description("Lấy danh sách khóa học đang có trên hệ thống nhà trường")]
        public async Task<List<CourseResponse>> GetAllCourseForTeacherAndStudent
        (
            [Description("Tên khóa học, không bắt buộc, điều kiện lọc. Nếu không có lấy hết")]
            string? courseName = null
        )
        {
            var query = context.Course.AsNoTracking().Where(x => x.Status == "Approved").AsQueryable();

            if (!string.IsNullOrWhiteSpace(courseName))
            {
                var name = courseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            query = query.OrderByDescending(x => x.PublishedAt);

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

        //DANH SÁCH KHÓA HỌC CỦA HỌC SINH
        [KernelFunction]
        [Description("Lấy danh sách khóa học đã đăng kí của học sinh")]
        public async Task<List<CourseResponse>> GetMyCourseForStudent
        (
            [Description("Tên khóa học, không bắt buộc, điều kiện lọc. Nếu không có lấy hết")]
            string? courseName = null
        )
        {
            var studentId = await context.Student.AsNoTracking().Where(x => x.UserId == userId).Select(g => g.Id).FirstOrDefaultAsync();
            if (studentId == Guid.Empty) return new List<CourseResponse>();

            var query = context.Course.AsNoTracking().Where(x => x.EnrollCourses.Any(g => g.StudentId == studentId));

            if (!string.IsNullOrWhiteSpace(courseName))
            {
                var name = courseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            query = query.OrderBy(x => x.CourseName);


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

        //LẤY THÔNG TIN CÁ NHÂN CỦA HỌC SINH ĐÓ
        [KernelFunction]
        [Description("Lấy thông tin cá nhân của học sinh đó")]
        public async Task<StudentInfoResponse> GetMyProfileForStudent()
        {
            var result = await context.Student
                .Where(x => x.UserId == userId)
                .Select(x => new StudentInfoResponse
                {
                    StudentId = x.Id,
                    UserId = x.User.Id,
                    Birthday = x.User.Birthday,
                    Email = x.User.Email,
                    Address = x.User.Address,
                    FullName = x.User.FullName,
                    PhoneNumber = x.User.PhoneNumber,
                    ClassYearSub = x.StudentClassYears
                                    .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                                    .Select(scy => new ClassYearSub
                                    {
                                        ClassName = scy.ClassYear.ClassName,
                                        Grade = scy.ClassYear.Grade,
                                        SchoolYear = scy.ClassYear.SchoolYear,
                                        HomeRoomTeacherName = scy.ClassYear.Teacher.User.FullName ?? "Không có dữ liệu"
                                    }).ToList()

                }).FirstOrDefaultAsync();

            return result;
        }
    }
}

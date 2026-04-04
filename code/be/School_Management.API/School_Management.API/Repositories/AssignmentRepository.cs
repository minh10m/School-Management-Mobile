using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly ApplicationDbContext context;

        public AssignmentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<(AssignmentResponse? data, string? message)> CreateAssignment(PostOrUpdateAssignmentRequest request, Guid userId)
        {
            var teacher = await context.Teacher
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return (null, "NOT_FOUND_TEACHER");

            var teacherSubject = await context.TeacherSubject.Include(x => x.Subject)
                                                             .Where(x => x.SubjectId == request.SubjectId
                                                                     && x.TeacherId == teacher.Id)
                                                             .FirstOrDefaultAsync();
            if (teacherSubject == null) return (null, "FORBIDDEN_TEACHER_SUBJECT");

            var normalizedName = request.Title?.Trim().ToLower();
            var isExistedName = await context.Assignment.AnyAsync(x => x.Title.Trim().ToLower() == normalizedName
                                                                 && x.TeacherSubject.SubjectId == request.SubjectId
                                                                 && x.ClassYearId == request.ClassYearId);
            if (isExistedName) return (null, "CONFLICT_TITLE");

            var startTimeVN = request.StartTime.ToOffset(TimeSpan.FromHours(7));
            var finishTimeVN = request.FinishTime.ToOffset(TimeSpan.FromHours(7));

            var officialStartTime = new DateTimeOffset(startTimeVN.Year, startTimeVN.Month, startTimeVN.Day,
                                                       startTimeVN.Hour, startTimeVN.Minute, 0, startTimeVN.Offset);
            var officialFinishTime = new DateTimeOffset(finishTimeVN.Year, finishTimeVN.Month, finishTimeVN.Day,
                                                        finishTimeVN.Hour, finishTimeVN.Minute, 0, finishTimeVN.Offset);

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                StartTime = officialStartTime.ToUniversalTime(),
                FinishTime = officialFinishTime.ToUniversalTime(),
                TeacherSubjectId = teacherSubject.TeacherSubjectId,
                Title = request.Title.Trim(),
                ClassYearId = request.ClassYearId,
                FileTitle = request.FileTitle?.Trim(),
                FileUrl = request.FileUrl?.Trim()
            };

            context.Assignment.Add(assignment);
            await context.SaveChangesAsync();

            return (new AssignmentResponse
            {
                AssignmentId = assignment.Id,
                StartTime = assignment.StartTime,
                FileTitle = assignment.FileTitle,
                TeacherSubjectId = assignment.TeacherSubjectId,
                ClassYearId = assignment.ClassYearId,
                FileUrl = assignment.FileUrl,
                Title = assignment.Title,
                FinishTime = assignment.FinishTime,
                TeacherName = teacher.User.FullName,
                SubjectName = teacherSubject.Subject.SubjectName
            }, "SUCCESS");
        }
    }
}

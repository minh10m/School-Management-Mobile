using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class TeacherSubjectRepository : ITeacherSubjectRepository
    {
        private readonly ApplicationDbContext context;

        public TeacherSubjectRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<(TeacherSubjectResponse? data, string? errorCode)> AssignSubjectForTeacher(TeacherSubjectRequest request)
        {
            var isExisted = await context.TeacherSubject.AnyAsync(x => x.TeacherId == request.TeacherId
                                                                    && x.SubjectId == request.SubjectId);

            if (isExisted) return (null, "DUPLICATE_SUBJECT");

            var teacherSubject = new TeacherSubject {
                TeacherSubjectId = Guid.NewGuid(),
                TeacherId = (Guid)request.TeacherId,
                SubjectId = (Guid)request.SubjectId
            };
            context.TeacherSubject.Add(teacherSubject);
            await context.SaveChangesAsync();
            var teacherSubjectInfo = await context.TeacherSubject.Where(x => x.TeacherSubjectId == teacherSubject.TeacherSubjectId)
                                                                 .Select(g => new
                                                                 {
                                                                     g.Teacher.User.FullName,
                                                                     g.Subject.SubjectName
                                                                 }).FirstOrDefaultAsync();

            return (new TeacherSubjectResponse
            {
                TeacherSubjectId = teacherSubject.TeacherSubjectId,
                TeacherId = teacherSubject.TeacherId,
                SubjectId = teacherSubject.SubjectId,
                TeacherName = teacherSubjectInfo.FullName,
                SubjectName = teacherSubjectInfo.SubjectName
            }, "SUCCESS");
        }

        public async Task<(TeacherSubjectResponse? data, string? errorCode)> UpdateSubjectAfterAssignForTeacher(UpdateTeacherSubjectRequest request)
        {
            var teacherSubject = await context.TeacherSubject.Where(x => x.TeacherId == request.TeacherId
                                                                   && x.SubjectId == request.OldSubjectId)
                                                             .FirstOrDefaultAsync();
            if (teacherSubject == null) return (null, "NOT_FOUND_TEACHERSUBJECT");

            var isExisted = await context.TeacherSubject.AnyAsync(x => x.TeacherId == request.TeacherId
                                                                 && x.SubjectId != request.OldSubjectId
                                                                 && x.SubjectId == request.NewSubjectId);

            if (isExisted) return (null, "DUPLICATE_SUBJECT");

            teacherSubject.SubjectId = request.NewSubjectId;
            await context.SaveChangesAsync();
            var teacherSubjectInfo = await context.TeacherSubject.Where(x => x.TeacherSubjectId == teacherSubject.TeacherSubjectId)
                                                                 .Select(g => new
                                                                 {
                                                                     g.Teacher.User.FullName,
                                                                     g.Subject.SubjectName
                                                                 }).FirstOrDefaultAsync();

            return (new TeacherSubjectResponse
            {
                TeacherSubjectId = teacherSubject.TeacherSubjectId,
                TeacherId = teacherSubject.TeacherId,
                SubjectId = teacherSubject.SubjectId,
                TeacherName = teacherSubjectInfo.FullName,
                SubjectName = teacherSubjectInfo.SubjectName
            }, "SUCCESS");
        }
    }
}

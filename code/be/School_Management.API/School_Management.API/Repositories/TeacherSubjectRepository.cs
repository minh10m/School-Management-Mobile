using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Services;
using Xceed.Document.NET;

namespace School_Management.API.Repositories
{
    public class TeacherSubjectRepository : ITeacherSubjectRepository
    {
        private readonly ApplicationDbContext context;
        private readonly INotificationService notificationService;
        private readonly ILogger<TeacherSubjectRepository> logger;

        public TeacherSubjectRepository(ApplicationDbContext context, INotificationService notificationService, ILogger<TeacherSubjectRepository> logger)
        {
            this.context = context;
            this.notificationService = notificationService;
            this.logger = logger;
        }

        public async Task<(TeacherSubjectResponse? data, string? errorCode)> AssignSubjectForTeacher(TeacherSubjectRequest request)
        {
            var isExisted = await context.TeacherSubject
                .AnyAsync(x =>
                    x.TeacherId == request.TeacherId &&
                    x.SubjectId == request.SubjectId &&
                    x.IsActive);

            if (isExisted)
                return (null, "DUPLICATE_SUBJECT");

            var teacherSubjectExisted = await context.TeacherSubject
                .FirstOrDefaultAsync(x =>
                    x.TeacherId == request.TeacherId &&
                    x.SubjectId == request.SubjectId &&
                    !x.IsActive);

            // ─── Reactivate old assignment ─────────────────────────────
            if (teacherSubjectExisted != null)
            {
                teacherSubjectExisted.IsActive = true;

                // QUAN TRỌNG: phải SaveChanges
                await context.SaveChangesAsync();

                var teacherSubjectInfo = await context.TeacherSubject
                    .Where(x => x.TeacherSubjectId == teacherSubjectExisted.TeacherSubjectId)
                    .Select(g => new
                    {
                        TeacherName = g.Teacher.User.FullName,
                        SubjectName = g.Subject.SubjectName,
                        UserOfTeacherId = g.Teacher.UserId
                    })
                    .FirstOrDefaultAsync();

                if (teacherSubjectInfo != null)
                {
                    try
                    {
                        await notificationService.CreateNotification(new CreateNotificationRequest
                        {
                            Content = $"Bạn đã được admin thêm môn {teacherSubjectInfo.SubjectName} vào danh sách môn mình dạy",
                            Title = "Gán môn dạy mới",
                            Type = "Gán môn dạy",
                            UserId = new List<Guid> { teacherSubjectInfo.UserOfTeacherId }
                        });
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "Push notification failed");
                    }

                    return (new TeacherSubjectResponse
                    {
                        TeacherSubjectId = teacherSubjectExisted.TeacherSubjectId,
                        TeacherId = teacherSubjectExisted.TeacherId,
                        SubjectId = teacherSubjectExisted.SubjectId,
                        TeacherName = teacherSubjectInfo.TeacherName,
                        SubjectName = teacherSubjectInfo.SubjectName
                    }, "SUCCESS");
                }
            }

            // ─── Create new assignment ────────────────────────────────
            var teacherSubject = new TeacherSubject
            {
                TeacherSubjectId = Guid.NewGuid(),
                TeacherId = request.TeacherId!.Value,
                SubjectId = request.SubjectId!.Value,
                IsActive = true
            };

            context.TeacherSubject.Add(teacherSubject);

            await context.SaveChangesAsync();

            var newTeacherSubjectInfo = await context.TeacherSubject
                .Where(x => x.TeacherSubjectId == teacherSubject.TeacherSubjectId)
                .Select(g => new
                {
                    TeacherName = g.Teacher.User.FullName,
                    SubjectName = g.Subject.SubjectName,
                    UserOfTeacherId = g.Teacher.UserId
                })
                .FirstOrDefaultAsync();

            if (newTeacherSubjectInfo != null)
            {
                try
                {
                    await notificationService.CreateNotification(new CreateNotificationRequest
                    {
                        Content = $"Bạn đã được admin thêm môn {newTeacherSubjectInfo.SubjectName} vào danh sách môn mình dạy",
                        Title = "Gán môn dạy mới",
                        Type = "Gán môn dạy",
                        UserId = new List<Guid> { newTeacherSubjectInfo.UserOfTeacherId }
                    });
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Push notification failed");
                }

                return (new TeacherSubjectResponse
                {
                    TeacherSubjectId = teacherSubject.TeacherSubjectId,
                    TeacherId = teacherSubject.TeacherId,
                    SubjectId = teacherSubject.SubjectId,
                    TeacherName = newTeacherSubjectInfo.TeacherName,
                    SubjectName = newTeacherSubjectInfo.SubjectName
                }, "SUCCESS");
            }

            return (null, "UNKNOWN_ERROR");
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

        public async Task<List<TeacherSubjectResponse>> GetTeacherSubjects(Guid teacherId)
        {
            return await context.TeacherSubject
                .Where(x => x.TeacherId == teacherId && x.IsActive == true)
                .Select(x => new TeacherSubjectResponse
                {
                    TeacherSubjectId = x.TeacherSubjectId,
                    TeacherId = x.TeacherId,
                    SubjectId = x.SubjectId,
                    TeacherName = x.Teacher.User.FullName,
                    SubjectName = x.Subject.SubjectName
                }).ToListAsync();
        }

        public async Task<(bool result, string message)> DeactivateTeacherSubject(Guid teacherSubjectId)
        {
            var teacherSubject = await context.TeacherSubject
                .Include(x => x.ScheduleDetails)
                .FirstOrDefaultAsync(x => x.TeacherSubjectId == teacherSubjectId);

            if (teacherSubject == null) return (false, "NOT_FOUND_TEACHERSUBJECT");

            if (teacherSubject.ScheduleDetails.Any())
            {
                context.ScheduleDetail.RemoveRange(teacherSubject.ScheduleDetails);
            }

            teacherSubject.IsActive = false;
            await context.SaveChangesAsync();

            return (true, "SUCCESS");
        }
    }
}

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class AssignmentRepository : IAssignmentRepository
    {
        private readonly ApplicationDbContext context;
        private readonly Cloudinary cloudinary;

        public AssignmentRepository(ApplicationDbContext context, Cloudinary cloudinary)
        {
            this.context = context;
            this.cloudinary = cloudinary;
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
            string fileUrl = "Không có dữ liệu";
            string? fileTitle = request.FileTitle?.Trim() ?? null;
            string? publicId = null;

            if(request.File != null && request.File.Length > 0)
            {
                using var stream = request.File.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(request.File.FileName, stream),
                    Folder = "assignments",
                    PublicId = Guid.NewGuid().ToString(),
                    Type = "upload",
                    AccessMode = "public"
                };
                var uploadResult = await cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null) return (null, "UPLOAD_FILE_FAILED");

                fileUrl = uploadResult.SecureUrl.ToString();
                if (string.IsNullOrEmpty(fileTitle)) fileTitle = request.File.FileName;
                publicId = uploadResult.PublicId;

            }

            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                StartTime = officialStartTime.ToUniversalTime(),
                FinishTime = officialFinishTime.ToUniversalTime(),
                TeacherSubjectId = teacherSubject.TeacherSubjectId,
                Title = request.Title.Trim(),
                PublicId = publicId,
                ClassYearId = request.ClassYearId,
                FileTitle = fileTitle ?? "Không có dữ liệu",
                FileUrl = fileUrl ?? "Không có dữ liệu"
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

        public async Task<PagedResponse<AssignmentListResponse>> GetAllAssignment(AssignmentFilterRequest request, Guid userId)
        {
            var teacher = await context.Teacher.FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return new PagedResponse<AssignmentListResponse>
            {
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = 0,
                Items = new List<AssignmentListResponse>()
            };

            var query = context.Assignment.Include(g => g.TeacherSubject).AsNoTracking()
                                          .Where(x => x.TeacherSubject.TeacherId == teacher.Id);

            if (request.ClassYearId.HasValue)
            {
                query = query.Where(x => x.ClassYearId == request.ClassYearId.Value);
            }

            if (request.SubjectId.HasValue)
            {
                query = query.Where(x => x.TeacherSubject.SubjectId == request.SubjectId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Title))
            {
                var normalizedName = request.Title.Trim().ToLower();
                query = query.Where(x => x.Title.ToLower().Contains(normalizedName));
            }

            query = query.OrderByDescending(x => x.StartTime).ThenByDescending(x => x.FinishTime);


            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var assignmentList = await query.Skip(skipResults).Take(request.PageSize)
                                            .Select(x => new AssignmentListResponse
                                            {
                                                AssignmentId = x.Id,
                                                StartTime = x.StartTime,
                                                FileTitle = x.FileTitle,
                                                FileUrl = x.FileUrl,
                                                FinishTime = x.FinishTime,
                                                Title = x.Title
                                            }).ToListAsync();
            return new PagedResponse<AssignmentListResponse>
            {
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = assignmentList
            };

        }

        public async Task<(AssignmentResponse? data, string? message)> GetAssignmentById(Guid assignmentId)
        {
            var vnOffset = TimeSpan.FromHours(7);
            var assignmentResult = await context.Assignment.AsNoTracking().Where(x => x.Id == assignmentId)
                                                     .Select(assignment => new AssignmentResponse
                                                     {
                                                         AssignmentId = assignment.Id,
                                                         ClassName = assignment.ClassYear.ClassName,
                                                         ClassYearId = assignment.ClassYearId,
                                                         FileTitle = assignment.FileTitle,
                                                         FileUrl = assignment.FileUrl,
                                                         FinishTime = assignment.FinishTime.ToOffset(vnOffset),
                                                         StartTime = assignment.StartTime.ToOffset(vnOffset),
                                                         SubjectName = assignment.TeacherSubject.Subject.SubjectName,
                                                         TeacherSubjectId = assignment.TeacherSubjectId,
                                                         TeacherName = assignment.TeacherSubject.Teacher.User.FullName,
                                                         Title = assignment.Title
                                                     }).FirstOrDefaultAsync();
            if (assignmentResult == null) return (null, "NOT_FOUND_ASSIGNMENT");
            return (assignmentResult, "SUCCESS");
        }

        public async Task<(PagedResponse<AssignmentResponseForStudent>? data, string? message)> GetMyAssignmentsForStudent(AssignmentForStudentRequest request, Guid userId)
        {
            var student = await context.Student.FirstOrDefaultAsync(x => x.UserId == userId);
            if (student == null) return (null, "NOT_FOUND_STUDENT");
            var query = context.Assignment.AsNoTracking().Where(x => x.ClassYearId == request.ClassYearId);
            query = query.OrderByDescending(x => x.StartTime).ThenByDescending(x => x.FinishTime);
            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;

            var listAssignment = await query.Skip(skipResults)
                                            .Take(request.PageSize)
                                            .Select(x => new AssignmentResponseForStudent
            {
                AssignmentId = x.Id,
                StartTime = x.StartTime,
                FileTitle = x.FileTitle,
                FileUrl = x.FileUrl,
                FinishTime = x.FinishTime,
                ClassName = x.ClassYear.ClassName,
                ClassYearId = x.ClassYearId,
                SubjectName = x.TeacherSubject.Subject.SubjectName,
                TeacherSubjectId = x.TeacherSubjectId,
                Title = x.Title,
                TeacherName = x.TeacherSubject.Teacher.User.FullName,
                Status = x.Submissions.Where(g => g.StudentId == student.Id).Select(h => h.Status).FirstOrDefault(),
            }).ToListAsync();

            return (new PagedResponse<AssignmentResponseForStudent>
            {
                Items = listAssignment,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            }, "SUCCESS");
                
        }

        public async Task<(AssignmentResponse? data, string? message)> UpdateAssignment(PostOrUpdateAssignmentRequest request, Guid userId, Guid assignmentId)
        {
            var assignment = await context.Assignment.Include(x => x.ClassYear).Include(x => x.TeacherSubject)
                                                     .FirstOrDefaultAsync(x => x.Id == assignmentId);
            if (assignment == null) return (null, "NOT_FOUND_ASSIGNMENT");

            var teacher = await context.Teacher.Include(x => x.User)
                                               .FirstOrDefaultAsync(x => x.UserId == userId);
            if (teacher == null) return (null, "NOT_FOUND_TEACHER");

            var teacherSubject = await context.TeacherSubject.Include(g => g.Subject)
                                                             .FirstOrDefaultAsync(x => x.TeacherId == teacher.Id && x.SubjectId == request.SubjectId);
            if (teacherSubject == null) return (null, "FORBIDDEN_TEACHER_SUBJECT");

            if(assignment.TeacherSubject.TeacherId != teacherSubject.TeacherId) return (null, "FORBIDDEN_TEACHER_SUBJECT");

            var normalizedName = request.Title.Trim().ToLower();
            var isExistedName = await context.Assignment.AnyAsync(x => x.ClassYearId == request.ClassYearId
                                                                 && x.TeacherSubject.SubjectId == request.SubjectId
                                                                 && x.Title.Trim().ToLower() == normalizedName
                                                                 && x.Id != assignmentId);
            if (isExistedName) return (null, "CONFLICT_TITLE");

            var startTimeVN = request.StartTime.ToOffset(TimeSpan.FromHours(7));
            var finishTimeVN = request.FinishTime.ToOffset(TimeSpan.FromHours(7));

            var officialStartTime = new DateTimeOffset(startTimeVN.Year, startTimeVN.Month, startTimeVN.Day,
                                                       startTimeVN.Hour, startTimeVN.Minute, 0, startTimeVN.Offset);
            var officialFinishTime = new DateTimeOffset(finishTimeVN.Year, finishTimeVN.Month, finishTimeVN.Day,
                                                        finishTimeVN.Hour, finishTimeVN.Minute, 0, finishTimeVN.Offset);

            string? fileUrl = assignment.FileUrl;
            string? fileTitle = assignment.FileTitle;

            if (request.File != null && request.File.Length > 0)
            {
                using var stream = request.File.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(request.File.FileName, stream),
                    Folder = "assignments",
                    PublicId = Guid.NewGuid().ToString() + "_" + Path.GetFileNameWithoutExtension(request.File.FileName)

                };
                var uploadResult = await cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null) return (null, "UPLOAD_FILE_FAILED");

                fileUrl = uploadResult.SecureUrl.ToString();
                if (string.IsNullOrEmpty(fileTitle)) fileTitle = request.File.FileName;

            }

            assignment.Title = request.Title;
            assignment.StartTime = officialStartTime.ToUniversalTime();
            assignment.FinishTime = officialFinishTime.ToUniversalTime();
            //assignment.FileUrl = request.FileUrl ?? assignment.FileUrl;
            assignment.FileTitle = request.FileTitle ?? assignment.FileTitle;
            assignment.TeacherSubjectId = teacherSubject.TeacherSubjectId;
            assignment.ClassYearId = request.ClassYearId;
            await context.Entry(assignment).Reference(x => x.ClassYear).LoadAsync();

            await context.SaveChangesAsync();
            return (new AssignmentResponse
            {
                AssignmentId = assignment.Id,
                StartTime = assignment.StartTime,
                FileTitle = assignment.FileTitle,
                FileUrl = assignment.FileUrl,
                FinishTime = assignment.FinishTime,
                ClassName = assignment.ClassYear.ClassName,
                ClassYearId = assignment.ClassYearId,
                SubjectName = teacherSubject.Subject.SubjectName,
                TeacherSubjectId = teacherSubject.TeacherSubjectId,
                TeacherName = teacher.User.FullName,
                Title = assignment.Title
            }, "SUCCESS");
        }
    }
}

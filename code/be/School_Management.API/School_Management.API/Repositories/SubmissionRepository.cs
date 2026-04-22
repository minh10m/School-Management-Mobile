using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly ApplicationDbContext context;
        private readonly Cloudinary cloudinary;
        private readonly ILogger<SubmissionRepository> logger;

        public SubmissionRepository(ApplicationDbContext context, Cloudinary cloudinary, ILogger<SubmissionRepository> logger)
        {
            this.context = context;
            this.cloudinary = cloudinary;
            this.logger = logger;
        }
        public async Task<(SubmissionResponse? data, string? message)> CreateSubmission(SubmissionRequest request, Guid userId)
        {
            var student = await context.Student.Include(x => x.User).FirstOrDefaultAsync(x => x.UserId == userId);
            if (student == null) return (null, "NOT_FOUND_STUDENT");

            var timeSubmit = DateTimeOffset.UtcNow;
            var assignment = await context.Assignment.FirstOrDefaultAsync(x => x.Id == request.AssignmentId);
            if (assignment == null) return (null, "NOT_FOUND_ASSIGNMENT");
            string status = string.Empty;

            status = (timeSubmit <= assignment.FinishTime.ToUniversalTime().AddSeconds(10)) ? "Đã nộp" : "Nộp trễ";

            var existingSubmission = await context.Submission
                              .FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == student.Id);
            if (existingSubmission != null) return (null, "TOO_FAST_REQUEST");

            string fileUrl = "Không có dữ liệu";
            string publicId = "";
            var longMaxSize = 20 * 1024 * 1024;
            if (request.File.Length > longMaxSize) return (null, "BIGGER_THAN_MAXSIZE");
            if (request.File != null && request.File.Length > 0)
            {
                using var stream = request.File.OpenReadStream();
                var uploadParams = new RawUploadParams
                {
                    File = new FileDescription(request.File.FileName, stream),
                    Folder = "submissions",
                    PublicId = Guid.NewGuid().ToString(),
                    Type = "upload",
                    AccessMode = "public"
                };
                var uploadResult = await cloudinary.UploadAsync(uploadParams);
                if (uploadResult.Error != null) return (null, "UPLOAD_FILE_FAILED");

                fileUrl = uploadResult.SecureUrl.ToString();
                publicId = uploadResult.PublicId ?? "";
            }

            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                Score = null,
                FileUrl = fileUrl,
                FileTitle = request.FileTitle,
                AssignmentId = request.AssignmentId,
                TimeSubmit = timeSubmit,
                StudentId = student.Id,
                PublicId = publicId,
                Status = status
            };

            context.Submission.Add(submission);
            await context.SaveChangesAsync();
            return (new SubmissionResponse
            {
                Score = null,
                Status = submission.Status,
                StudentId = submission.StudentId,
                StudentName = student.User.FullName,
                SubmissionId = submission.Id,
                TimeSubmit = submission.TimeSubmit,
                AssignmentId = submission.AssignmentId,
                FileTitle = submission.FileTitle,
                FileUrl = submission.FileUrl

            }, "SUCCESS");
        }

        public async Task<(PagedResponse<SubmissionResponse>? data, string? message)> GetAllSubmissionOfAssignmentForTeacher(SubmissionFilterRequest request, Guid userId)
        {
            var teacherId = await context.Teacher.Where(x => x.UserId == userId).Select(g => g.Id).FirstOrDefaultAsync();
            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");

            var assignmentInfo = await context.Assignment.Where(x => x.Id == request.AssignmentId)
                                                         .Select(x => new
                                                         {
                                                             x.TeacherSubject.TeacherId,
                                                             x.Id
                                                         })
                                                         .FirstOrDefaultAsync();
            if (assignmentInfo == null) return (null, "NOT_FOUND_ASSIGNMENT");

            if (assignmentInfo.TeacherId != teacherId)
                return (null, "NOT_A_TEACHER_OF_ASSIGNMENT");
            var query = context.Submission.AsNoTracking().Where(x => x.AssignmentId == assignmentInfo.Id);

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                var nomalizedName = request.Status.Trim().ToLower();
                query = query.Where(x => x.Status.Trim().ToLower().Contains(nomalizedName));
            }
            if(!string.IsNullOrWhiteSpace(request.FileTitle))
            {
                var nomalizedName = request.FileTitle.Trim().ToLower();
                query = query.Where(x => x.FileTitle.Trim().ToLower().Contains(nomalizedName));
            }

            query = query.OrderByDescending(x => x.TimeSubmit);

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;

            var listSubmission = await query.Skip(skipResults).Take(request.PageSize)
                                            .Select(x => new SubmissionResponse
                                            {
                                                AssignmentId = x.AssignmentId,
                                                Score = x.Score,
                                                Status = x.Status,
                                                StudentId = x.StudentId,
                                                SubmissionId = x.Id,
                                                TimeSubmit = x.TimeSubmit,
                                                FileTitle = x.FileTitle,
                                                FileUrl = x.FileUrl,
                                                StudentName = x.Student.User.FullName
                                            }).ToListAsync();
            return (new PagedResponse<SubmissionResponse>
            {
                Items = listSubmission,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            }, "SUCCESS");
        }

        public async Task<(SubmissionResponse? data, string? message)> GetSubmissionById(Guid submissionId)
        {
            var submission = await context.Submission.FirstOrDefaultAsync(x => x.Id == submissionId);
            if (submission == null) return (null, "NOT_FOUND_SUBMISSION");

            var result = await context.Submission.Where(x => x.Id == submissionId)
                                                 .Select(g => new SubmissionResponse
                                                 {
                                                     AssignmentId = g.AssignmentId,
                                                     FileTitle = g.FileTitle,
                                                     FileUrl = g.FileUrl,
                                                     Score = g.Score,
                                                     Status = g.Status,
                                                     StudentId = g.StudentId,
                                                     StudentName = g.Student.User.FullName,
                                                     SubmissionId = g.Id,
                                                     TimeSubmit = g.TimeSubmit
                                                 }).FirstOrDefaultAsync();
            return (result, "SUCCESS");
        }

        public async Task<(SubmissionResponse? data, string? message)> GetSubmissionOfAssignmentForStudent(SubmissionStudentRequest request, Guid userId)
        {
            var studentId = await context.Student.Where(x => x.UserId == userId).Select(x => x.Id).FirstOrDefaultAsync();
            if (studentId == Guid.Empty) return (null, "NOT_FOUND_STUDENT");

            var assignmentInfo = await context.Assignment.Where(x => x.Id == request.AssignmentId)
                                                         .Select(x => new
                                                         {
                                                             x.TeacherSubject.TeacherId,
                                                             x.Id
                                                         })
                                                         .FirstOrDefaultAsync();
            if (assignmentInfo == null) return (null, "NOT_FOUND_ASSIGNMENT");

            var result = await context.Submission.AsNoTracking()
                                                 .Where(x => x.AssignmentId == request.AssignmentId && x.StudentId == studentId)
                                                 .Select(g => new SubmissionResponse
                                                 {
                                                     AssignmentId = g.AssignmentId,
                                                     FileTitle = g.FileTitle,
                                                     FileUrl = g.FileUrl,
                                                     Score = g.Score,
                                                     Status = g.Status,
                                                     StudentId = g.StudentId,
                                                     StudentName = g.Student.User.FullName,
                                                     SubmissionId = g.Id,
                                                     TimeSubmit = g.TimeSubmit
                                                 }).FirstOrDefaultAsync();
            return (result, "SUCCESS");
        }

        public async Task<(SubmissionResponse? data, string? message)> ScoreSubmission(ScoreSubmissionRequest request, Guid submissionId, Guid userId)
        {
            var teacherId = await context.Teacher.Where(x => x.UserId == userId).Select(g => g.Id).FirstOrDefaultAsync();
            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");
            var submission = await context.Submission.Include(x => x.Student)
                                                     .ThenInclude(x => x.User)
                                                     .Include(x => x.Assignment)
                                                     .ThenInclude(x => x.TeacherSubject)
                                                     .FirstOrDefaultAsync(x => x.Id == submissionId);
            if (submission == null) return (null, "NOT_FOUND_SUBMISSION");

            if (teacherId != submission.Assignment.TeacherSubject.TeacherId)
                return (null, "NOT_A_TEACHER_OF_ASSIGNMENT");

            submission.Score = request.Score;
            submission.Status = "Đã chấm";
            await context.SaveChangesAsync();
            var result =  new SubmissionResponse
            {
                AssignmentId = submission.AssignmentId,
                FileTitle = submission.FileTitle,
                FileUrl = submission.FileUrl,
                Score = submission.Score,
                Status = submission.Status,
                StudentId = submission.StudentId,
                StudentName = submission.Student.User.FullName,
                SubmissionId = submission.Id,
                TimeSubmit = submission.TimeSubmit
            };

            return (result, "SUCCESS");
        }

        public async Task<(SubmissionResponse? data, string message)> UpdateSubmission(SubmissionUpdateRequest request, Guid submissionId)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var submission = await context.Submission.FirstOrDefaultAsync(x => x.Id == submissionId);
                if (submission == null) return (null, "NOT_FOUND_SUBMISSION");

                if (submission.Status == "Đã chấm") return (null, "SUBMISSION_HAS_SCORE");
                var oldPublicId = submission.PublicId;

                string fileUrl = "Không có dữ liệu";
                string? fileTitle = request.FileTitle?.ToString().Trim() ?? null;
                string publicId = "Không có dữ liệu";
                var longMaxSize = 20 * 1024 * 1024;
                if (request.File.Length > longMaxSize) return (null, "BIGGER_THAN_MAXSIZE");
                if (request.File != null && request.File?.Length > 0)
                {
                    using var stream = request.File.OpenReadStream();
                    var uploadParams = new RawUploadParams
                    {
                        File = new FileDescription(request.File.FileName, stream),
                        Folder = "submissions",
                        PublicId = Guid.NewGuid().ToString(),
                        Type = "upload",
                        AccessMode = "public"
                    };
                    var resultParams = await cloudinary.UploadAsync(uploadParams);
                    if (resultParams.Error != null) return (null, "UPLOAD_FAILED");

                    fileUrl = resultParams.SecureUrl.ToString();
                    if (fileTitle == null) fileTitle = request.File.FileName.ToString();
                    publicId = resultParams.PublicId;
                }

                submission.FileUrl = fileUrl;
                submission.FileTitle = fileTitle;
                submission.PublicId = publicId;
                submission.TimeSubmit = DateTime.UtcNow;

                var studentName = await context.Student.Where(x => x.Id == submission.StudentId).Select(g => g.User.FullName).FirstOrDefaultAsync();

                await context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(oldPublicId))
                {
                    var destroyParams = new DeletionParams(oldPublicId)
                    {
                        ResourceType = ResourceType.Raw
                    };
                    var deleteResults = await cloudinary.DestroyAsync(destroyParams);
                    if (deleteResults.Result != "ok") logger.LogError("CANNOT DELETE FILE IN CLOUDINARY");
                }


                await transaction.CommitAsync();
                var result = new SubmissionResponse
                {
                    AssignmentId = submission.AssignmentId,
                    Score = submission.Score,
                    Status = submission.Status,
                    StudentId = submission.StudentId,
                    SubmissionId = submission.Id,
                    TimeSubmit = submission.TimeSubmit,
                    FileTitle = submission.FileTitle,
                    FileUrl = submission.FileUrl,
                    StudentName = studentName ?? "Không có dữ liệu"
                };

                return (result, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
            
        }
    }
}

using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly ApplicationDbContext context;

        public SubmissionRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(SubmissionResponse? data, string? message)> CreateSubmission(SubmissionRequest request, Guid userId)
        {
            var student = await context.Student.Include(x => x.User).FirstOrDefaultAsync(x => x.UserId == userId);
            if (student == null) return (null, "NOT_FOUND_STUDENT");

            var timeSubmit = DateTimeOffset.UtcNow;
            var assignment = await context.Assignment.FirstOrDefaultAsync(x => x.Id == request.AssignmentId);
            if (assignment == null) return (null, "NOT_FOUND_ASSIGNMENT");
            string status = string.Empty;

            status = (timeSubmit <= assignment.FinishTime) ? "Đã nộp" : "Nộp trễ";

            var existingSubmission = await context.Submission
                              .FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == student.Id);
            if (existingSubmission != null) return (null, "TOO_FAST_REQUEST");

            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                Score = null,
                FileUrl = request.FileUrl,
                FileTitle = request.FileTitle,
                AssignmentId = request.AssignmentId,
                TimeSubmit = timeSubmit,
                StudentId = student.Id,
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
    }
}

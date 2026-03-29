using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class SubjectRepository : ISubjectRepository
    {
        private readonly ApplicationDbContext context;

        public SubjectRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<SubjectResponse?> CreateSubject(PostOrUpdateSubjectRequest request)
        {
            var normalizedName = request.SubjectName.Trim().ToLower();
            var isExistedName = await context.Subject
                                             .AnyAsync(x => x.SubjectName.ToLower() == normalizedName);

            if (isExistedName) return null;
            var newSubject = new Subject
            {
                Id = Guid.NewGuid(),
                SubjectName = request.SubjectName,
                MaxPeriod = request.MaxPeriod
            };

            context.Subject.Add(newSubject);
            await context.SaveChangesAsync();

            return new SubjectResponse
            {
                SubjectId = newSubject.Id,
                SubjectName = newSubject.SubjectName,
                MaxPeriod = newSubject.MaxPeriod
            };
        }

        public async Task<(SubjectResponse? data, string? errorCode)> UpdateSubject(PostOrUpdateSubjectRequest request, Guid subjectId)
        {
            var subject = await context.Subject.Where(x => x.Id == subjectId).FirstOrDefaultAsync();
            if (subject == null) return (null, "NOT_FOUND");
            var normalizedName = request.SubjectName.Trim();
            var isExistedName = await context.Subject
                                             .AnyAsync(x => x.SubjectName.ToLower() == normalizedName.ToLower() && x.Id != subjectId);

            if (isExistedName) return (null, "DUPLICATE_NAME");

            subject.SubjectName = normalizedName;
            subject.MaxPeriod = request.MaxPeriod;
            await context.SaveChangesAsync();

            return (new SubjectResponse
            {
                SubjectId = subject.Id,
                SubjectName = subject.SubjectName,
                MaxPeriod = subject.MaxPeriod
            }, "SUCCESS");
        }
    }
}

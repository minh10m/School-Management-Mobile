using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
                MaxPeriod = (int)request.MaxPeriod
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

        public async Task<List<SubjectResponse>> GetAllSubject(SubjectFilterRequest request)
        {
            var query = context.Subject.AsNoTracking().AsQueryable();

            //Filtering
            if (!string.IsNullOrWhiteSpace(request.SubjectName))
                query = query.Where(x => x.SubjectName.ToLower().Contains(request.SubjectName.ToLower()));
            if (request.MaxPeriod.HasValue)
                query = query.Where(x => x.MaxPeriod == request.MaxPeriod);

            //Sorting
            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("SubjectName", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.SubjectName) : query.OrderByDescending(x => x.SubjectName);
                }
                else if (request.SortBy.Equals("MaxPeriod", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.MaxPeriod) : query.OrderByDescending(x => x.MaxPeriod);

                }
            }

            var subjectList = await query.Select(x => new SubjectResponse {
                SubjectId = x.Id,
                MaxPeriod = x.MaxPeriod,
                SubjectName = x.SubjectName
            }).ToListAsync();
            return subjectList;
        }

        public async Task<PagedResponse<TeacherOfSubjectResponse>?> GetListTeacherBySubjectId(TeacherSubjectFilterRequest request, Guid subjectId)
        {
            var isSubjectExisted = await context.Subject.AnyAsync(x => x.Id == subjectId);
            if (!isSubjectExisted) return null;

            var query = context.Teacher.AsNoTracking().Where(x => x.TeacherSubjects.Any(ts => ts.SubjectId == subjectId));

            //Filtering
            if(!string.IsNullOrWhiteSpace(request.FullName))
            {
                var name = request.FullName.Trim().ToLower();
                query = query.Where(x => x.User.FullName.ToLower().Contains(name));
            }
            if(!string.IsNullOrWhiteSpace(request.Email))
            {
                var email = request.Email.ToLower();
                query = query.Where(x => x.User.Email.ToLower().Contains(email));
            }

            //Sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.User.FullName) : query.OrderByDescending(x => x.User.FullName);
                }
                else if (request.SortBy.Equals("Email", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.User.Email) : query.OrderByDescending(x => x.User.Email);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;


            var listTeacher = await query
                            .Skip(skipResults)
                            .Take(request.PageSize)
                            .Select(g => new TeacherOfSubjectResponse
            {
                TeacherSubjectId = g.TeacherSubjects.Where(ts => ts.SubjectId == subjectId).Select(ts => ts.TeacherSubjectId).FirstOrDefault(),
                Email = g.User.Email,
                FullName = g.User.FullName,
                PhoneNumber = g.User.PhoneNumber,
                TeacherId = g.Id,
                UserId = g.User.Id
            }).ToListAsync();

            return new PagedResponse<TeacherOfSubjectResponse>
            {
                Items = listTeacher,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            };
        }

        public async Task<SubjectResponse?> GetSubjectById(Guid subjectId)
        {
            return await context.Subject.AsNoTracking()
                                        .Where(x => x.Id == subjectId)
                                        .Select(g => new SubjectResponse {
                                            SubjectId = g.Id,
                                            SubjectName = g.SubjectName,
                                            MaxPeriod = g.MaxPeriod
                                        }).FirstOrDefaultAsync();
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
            subject.MaxPeriod = (int)request.MaxPeriod;
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

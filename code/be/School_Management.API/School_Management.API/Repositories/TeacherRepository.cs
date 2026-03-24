using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class TeacherRepository : ITeacherRepository
    {
        private readonly ApplicationDbContext context;

        public TeacherRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<PagedResponse<TeacherListResponse>> GetAllTeacher(string? filterOn, string? filterQuery, string? sortBy, bool isAscending, int pageNumber, int pageSize)
        {
            var query = context.Teacher.AsQueryable();

            //filtering
            if(!string.IsNullOrWhiteSpace(filterOn) && !string.IsNullOrWhiteSpace(filterQuery))
            {
                if(filterOn.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.User.FullName.Contains(filterQuery));
                }
                else if (filterOn.Equals("SubjectName", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.TeacherSubjects.Any(ts => ts.Subject.SubjectName.Contains(filterQuery)));
                }
            }

            //sorting
            if(!string.IsNullOrWhiteSpace(sortBy))
            {
                if (sortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isAscending ? query.OrderBy(x => x.User.FullName) : query.OrderByDescending(x => x.User.FullName);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (pageNumber - 1) * pageSize;

            var ListTeachers = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new TeacherListResponse
            {
                TeacherId = x.Id,
                FullName = x.User.FullName,
                UserId = x.User.Id,
                SubjectNames = x.TeacherSubjects
                               .Select(x => x.Subject.SubjectName)
                               .ToList()

            }).ToListAsync();

            return new PagedResponse<TeacherListResponse>
            {
                Items = ListTeachers,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId)
        {
            throw new NotImplementedException();
        }

        public async Task<TeacherInfoResponse> GetTeacherById(Guid teacherId)
        {
            var result = await context.Teacher
                                .AsNoTracking()
                                .Where(x => x.Id == teacherId)
                                .Select(x => new TeacherInfoResponse
                                {
                                    UserId = x.User.Id,
                                    Address = x.User.Address,
                                    Birthday = x.User.Birthday,
                                    Email = x.User.Email,
                                    FullName = x.User.FullName,
                                    PhoneNumber = x.User.PhoneNumber,
                                    TeacherId = x.Id,
                                    SubjectNames = x.TeacherSubjects
                                                   .Select(ts => ts.Subject.SubjectName)
                                                   .ToList()
                                }).FirstOrDefaultAsync();
            return result;
        }
    }
}

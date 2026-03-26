using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
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
        public async Task<PagedResponse<TeacherListResponse>> GetAllTeacher(TeacherFilterRequest request)
        {
            var query = context.Teacher.AsQueryable();

            //filtering
            if(!string.IsNullOrWhiteSpace(request.FullName))
                query = query.Where(x => x.User.FullName.Contains(request.FullName));

            if (!string.IsNullOrWhiteSpace(request.SubjectName))
                query = query.Where(x => x.TeacherSubjects.Any(ts => ts.Subject.SubjectName.Contains(request.SubjectName)));


            //sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.User.FullName) : query.OrderByDescending(x => x.User.FullName);
                }
            }

            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;

            var ListTeachers = await query
                .Skip(skipResults)
                .Take(request.PageSize)
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
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId)
        {
            var result = await context.Teacher
                                .AsNoTracking()
                                .Where(x => x.UserId == userId)
                                .Select(x => new TeacherInfoResponse
                                {
                                    FullName = x.User.FullName,
                                    Address = x.User.Address,
                                    Birthday = x.User.Birthday,
                                    Email = x.User.Email,
                                    PhoneNumber = x.User.PhoneNumber,
                                    TeacherId = x.Id,
                                    UserId = x.User.Id,
                                    SubjectNames = x.TeacherSubjects
                                                    .Select(ts => ts.Subject.SubjectName)
                                                    .ToList()
                                }).FirstOrDefaultAsync();
            return result;
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

        public async Task<Guid> GetTeacherIdByUserId(Guid userId)
        {
            return await context.Teacher
                                .Where(x => x.UserId == userId)
                                .Select(x => x.Id)
                                .FirstOrDefaultAsync();
        }

        public async Task<Guid> GetUserIdByTeacherid(Guid teacherId)
        {
            return await context.Teacher
                                .Where(x => x.Id == teacherId)
                                .Select(x => x.UserId)
                                .FirstOrDefaultAsync();
        }

        public async Task<TeacherInfoResponse> ReturnData(AppUser user, Guid teacherId)
        {
            return new TeacherInfoResponse
            {
                Address = user.Address,
                Birthday = user.Birthday,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                TeacherId = teacherId,
                UserId = user.Id,
                SubjectNames =  await context.TeacherSubject
                                      .Where(x => x.TeacherId == teacherId)
                                      .Select(ts => ts.Subject.SubjectName)
                                      .ToListAsync()
            };
        }
    }
}

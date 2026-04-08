using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly ApplicationDbContext context;

        public StudentRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<PagedResponse<StudentListResponse>> GetAllStudent(StudentFilterRequest request)
        {
            var query = context.Student.AsQueryable();

            //Filtering
            if (!string.IsNullOrWhiteSpace(request.FullName))
                query = query.Where(x => x.User.FullName.ToLower().Contains(request.FullName.ToLower()));
            if(!string.IsNullOrWhiteSpace(request.ClassName))
                query = query.Where(x => x.StudentClassYears.Any(scy => scy.ClassYear.ClassName.ToLower().Contains(request.ClassName.ToLower())));
            if(request.Grade != 0)
                query = query.Where(x => x.StudentClassYears.Any(scy => scy.ClassYear.Grade == request.Grade));
                   
          

            //Sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if (request.SortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = (request.IsAscending)
                        ? query.OrderBy(x => x.User.FullName)
                        : query.OrderByDescending(x => x.User.FullName);
                }
                else if (request.SortBy.Equals("ClassName", StringComparison.OrdinalIgnoreCase))
                {
                    query = (request.IsAscending)
                        ? query.OrderBy(x => x.StudentClassYears
                            .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                            .Select(scy => scy.ClassYear.ClassName)
                            .FirstOrDefault())
                        : query.OrderByDescending(x => x.StudentClassYears
                            .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                            .Select(scy => scy.ClassYear.ClassName)
                            .FirstOrDefault());
                }
                else if (request.SortBy.Equals("Grade", StringComparison.OrdinalIgnoreCase))
                {
                    query = (request.IsAscending)
                        ? query.OrderBy(x => x.StudentClassYears
                            .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                            .Select(scy => scy.ClassYear.Grade)
                            .FirstOrDefault())
                        : query.OrderByDescending(x => x.StudentClassYears
                            .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                            .Select(scy => scy.ClassYear.Grade)
                            .FirstOrDefault());
                }
            }

            var totalCount = await query.CountAsync();

            var ListStudent = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new StudentListResponse
            {
                StudentId = x.Id,
                UserId = x.User.Id,
                FullName = x.User.FullName,
                ClassName = x.StudentClassYears
                             .OrderByDescending(x => x.ClassYear.SchoolYear)
                             .Select(x => x.ClassYear.ClassName)
                             .FirstOrDefault(),
                Grade = x.StudentClassYears
                             .OrderByDescending(x => x.ClassYear.SchoolYear)
                             .Select(x => x.ClassYear.Grade)
                             .FirstOrDefault()

            }).ToListAsync();

            return new PagedResponse<StudentListResponse>
            {
                Items = ListStudent,
                PageSize = request.PageSize,
                PageNumber = request.PageNumber,
                TotalCount = totalCount
            };
            
        }

        public async Task<StudentClassYear?> GetClassRelationByStudentId(Guid studentId)
        {
            return await context.StudentClassYear
                                .Where(x => x.StudentId == studentId)
                                .OrderByDescending(x => x.ClassYear.SchoolYear)
                                .FirstOrDefaultAsync();
        }

        public async Task<Guid?> GetHomeRoomId(Guid studentId)
        {
            return await context.StudentClassYear
                                        .Where(x => x.StudentId == studentId)
                                        .OrderByDescending(x => x.ClassYear.SchoolYear)
                                        .Select(x => x.ClassYear.HomeRoomId)
                                        .FirstOrDefaultAsync();
        }

        public async Task<StudentInfoResponse> GetMyProfileForStudent(Guid userId)
        {
            var result = await context.Student
                .Where(x => x.UserId == userId)
                .Select(x => new StudentInfoResponse
                {
                    StudentId = x.Id,
                    UserId = x.User.Id,
                    Birthday = x.User.Birthday,
                    Email = x.User.Email,
                    Address = x.User.Address,
                    FullName = x.User.FullName,
                    PhoneNumber = x.User.PhoneNumber,
                    ClassYearSub = x.StudentClassYears
                                    .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                                    .Select(scy => new ClassYearSub
                                    {
                                        ClassName = scy.ClassYear.ClassName,
                                        Grade = scy.ClassYear.Grade,
                                        SchoolYear = scy.ClassYear.SchoolYear
                                    }).ToList()

                }).FirstOrDefaultAsync();

            return result;
        }

        public async Task<StudentInfoResponse> GetStudentById(Guid studentId)
        {
            var result = await context.Student
                .Where(x => x.Id == studentId)
                .Select(x => new StudentInfoResponse
                {
                    StudentId = studentId,
                    UserId = x.User.Id,
                    Birthday = x.User.Birthday,
                    Email = x.User.Email,
                    FullName = x.User.FullName,
                    Address = x.User.Address,
                    PhoneNumber = x.User.PhoneNumber,
                    ClassYearSub = x.StudentClassYears
                                    .OrderByDescending(scy => scy.ClassYear.SchoolYear)
                                    .Select(scy => new ClassYearSub
                                    {
                                        ClassName = scy.ClassYear.ClassName,
                                        Grade = scy.ClassYear.Grade,
                                        SchoolYear = scy.ClassYear.SchoolYear
                                    }).ToList()

                }).FirstOrDefaultAsync();

            return result;
        }

        public async Task<Guid> GetStudentIdByUserId(Guid userId)
        {
            return await context.Student
                                .Where(x => x.User.Id == userId)
                                .Select(x => x.Id)
                                .FirstOrDefaultAsync();
        }

        public async Task<Guid?> GetTeacherIdByUserId(Guid userId)
        {
            return await context.Teacher
                                       .Where(x => x.UserId == userId)
                                       .Select(x => x.Id)
                                       .FirstOrDefaultAsync();
        }

        public async Task<Guid> GetUserIdByStudentId(Guid studentId)
        {
            var userId = await context.Student.Where(x => x.Id == studentId)
                                        .Select(re => re.User.Id)
                                        .FirstOrDefaultAsync();
            return userId;
        }
    }
}

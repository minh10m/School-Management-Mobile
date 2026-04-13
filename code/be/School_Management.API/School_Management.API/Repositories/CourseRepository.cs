using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Security.Claims;

namespace School_Management.API.Repositories
{
    public class CourseRepository : ICourseRepository
    {
        private readonly ApplicationDbContext context;

        public CourseRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(CourseResponse? data, string? message)> CreateCourse(CreateCourseRequest request, Guid userId)
        {
            var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId)
                                                                .Select(g => g.Id)
                                                                .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");
            var teacherSubjectInfo = await context.TeacherSubject.AsNoTracking()
                                                                              .Where(x => x.TeacherId == teacherId && x.SubjectId == request.SubjectId)
                                                                              .Select(g => new { g.TeacherSubjectId, g.Teacher.User.FullName, g.Subject.SubjectName })
                                                                              .FirstOrDefaultAsync();
            if (teacherSubjectInfo == null) return (null, "NOT_FOUND_TEACHERSUBJECTID");

            var isExisted = await context.Course.AnyAsync(x => x.CourseName.Trim().ToLower() == request.CourseName.Trim().ToLower() && x.TeacherSubject.TeacherId == teacherId);
            if (isExisted) return (null, "DUPLICATED_COURSENAME");

            if (request.Price < 0) return (null, "UNCORRECT_PRICE");

            var course = new Course
            {
                Id = Guid.NewGuid(),
                TeacherSubjectId = teacherSubjectInfo.TeacherSubjectId,
                CourseName = request.CourseName,
                Description = request.Description,
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedAt = null,
                Price = request.Price,
                Status = "Pending"
            };

            context.Course.Add(course);
            await context.SaveChangesAsync();

            return (new CourseResponse
            {
                Id = course.Id,
                Description = course.Description,
                CourseName = course.CourseName,
                CreatedAt = course.CreatedAt,
                Price = course.Price,
                Status = course.Status,
                PublishedAt = course.PublishedAt,
                SubjectName = teacherSubjectInfo.SubjectName,
                TeacherSubjectId = course.TeacherSubjectId,
                TeacherName = teacherSubjectInfo.FullName
            }, "SUCCESS");
        }

        public async Task<PagedResponse<CourseResponse>> GetAllCourseForAdmin(CourseFilterRequestAdmin request)
        {
            var query = context.Course.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.CourseName))
            {
                var name = request.CourseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            if (!string.IsNullOrWhiteSpace(request.Status))
            {
                var name = request.Status.Trim().ToLower();
                query = query.Where(x => x.Status.Trim().ToLower().Contains(name));
            }
            
            if (request.SubjectId.HasValue)
            {
                query = query.Where(x => x.TeacherSubject.SubjectId == request.SubjectId.Value);
            }

            if (request.MinPrice.HasValue)
            {
                query = query.Where(x => x.Price >= request.MinPrice.Value);
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(x => x.Price <= request.MaxPrice.Value);
            }

            if (request.Status == "Approved")
                query = query.OrderByDescending(x => x.PublishedAt);
            else
                query = query.OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;
            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(g => new CourseResponse
                                        {
                                            Id = g.Id,
                                            CourseName = g.CourseName,
                                            CreatedAt = g.CreatedAt,
                                            Description = g.Description,
                                            Price = g.Price,
                                            PublishedAt = g.PublishedAt,
                                            Status = g.Status,
                                            SubjectName = g.TeacherSubject.Subject.SubjectName,
                                            TeacherSubjectId = g.TeacherSubjectId,
                                            TeacherName = g.TeacherSubject.Teacher.User.FullName
                                        }).ToListAsync();

            return new PagedResponse<CourseResponse>
            {
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = listResult
            };

        }

        public async Task<PagedResponse<CourseResponse>> GetAllCourseForTeacherAndStudent(CourseFilterRequestTeacherAndStudent request)
        {
            var query = context.Course.AsNoTracking().Where(x => x.Status == "Approved").AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.CourseName))
            {
                var name = request.CourseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            query = query.OrderByDescending(x => x.PublishedAt);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;
            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(g => new CourseResponse
                                        {
                                            Id = g.Id,
                                            CourseName = g.CourseName,
                                            CreatedAt = g.CreatedAt,
                                            Description = g.Description,
                                            Price = g.Price,
                                            PublishedAt = g.PublishedAt,
                                            Status = g.Status,
                                            SubjectName = g.TeacherSubject.Subject.SubjectName,
                                            TeacherSubjectId = g.TeacherSubjectId,
                                            TeacherName = g.TeacherSubject.Teacher.User.FullName
                                        }).ToListAsync();

            return new PagedResponse<CourseResponse>
            {
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = listResult
            };
        }

        public async Task<(CourseResponse? data, string? message)> GetCourseById(Guid courseId)
        {
            var course = await context.Course.AsNoTracking()
                                             .Include(x => x.TeacherSubject).ThenInclude(x => x.Teacher).ThenInclude(x => x.User)
                                             .Include(x => x.TeacherSubject).ThenInclude(x => x.Subject)
                                             .FirstOrDefaultAsync(x => x.Id == courseId);
            if (course == null) return (null, "NOT_FOUND_COURSE");

            return (new CourseResponse
            {
                Id = course.Id,
                Description = course.Description,
                CourseName = course.CourseName,
                CreatedAt = course.CreatedAt,
                Price = course.Price,
                PublishedAt = course.PublishedAt,
                Status = course.Status,
                TeacherSubjectId = course.TeacherSubjectId,
                TeacherName = course.TeacherSubject.Teacher.User.FullName,
                SubjectName = course.TeacherSubject.Subject.SubjectName
            }, "SUCCESS");
        }

        public async Task<(PagedResponse<CourseResponse>? data, string? message)> GetMyCourseForTeacher(MyCourseFilterRequest request, Guid userId)
        {
            var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId)
                                                     .Select(g => g.Id)
                                                     .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER");

            var query = context.Course.AsNoTracking()
                                      .Where(x => x.TeacherSubject.TeacherId == teacherId)
                                      .AsQueryable();
            if(!string.IsNullOrWhiteSpace(request.CourseName))
            {
                var name = request.CourseName.Trim().ToLower();
                query = query.Where(x => x.CourseName.Trim().ToLower().Contains(name));
            }

            query = query.OrderByDescending(x => x.CreatedAt);

            var totalCount = await query.CountAsync();
            var skipsResult = (request.PageNumber - 1) * request.PageSize;

            var listResult = await query.Skip(skipsResult).Take(request.PageSize)
                                        .Select(g => new CourseResponse
                                        {
                                            Id = g.Id,
                                            CourseName = g.CourseName,
                                            CreatedAt = g.CreatedAt,
                                            Description = g.Description,
                                            Price = g.Price,
                                            PublishedAt = g.PublishedAt,
                                            Status = g.Status,
                                            SubjectName = g.TeacherSubject.Subject.SubjectName,
                                            TeacherSubjectId = g.TeacherSubjectId,
                                            TeacherName = g.TeacherSubject.Teacher.User.FullName
                                        }).ToListAsync();

            return (new PagedResponse<CourseResponse>
            {
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                Items = listResult
            }, "SUCCESS");
        }

        public async Task<(CourseResponse? data, string? message)> ReviseCourseForAdmin(Guid courseId, UpdateStatusCourseRequest request)
        {
            var course = await context.Course
                .FirstOrDefaultAsync(x => x.Id == courseId);

            if (course == null) return (null, "NOT_FOUND_COURSE");

            course.Status = request.Status;

            if (request.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            {
                course.PublishedAt = DateTimeOffset.UtcNow;
            }

            await context.SaveChangesAsync();

            var result = await context.Course.AsNoTracking()
                .Where(x => x.Id == courseId)
                .Select(c => new CourseResponse
                {
                    Id = c.Id,
                    Description = c.Description,
                    CourseName = c.CourseName,
                    CreatedAt = c.CreatedAt,
                    Price = c.Price,
                    PublishedAt = c.PublishedAt,
                    Status = c.Status,
                    TeacherSubjectId = c.TeacherSubjectId,
                    TeacherName = c.TeacherSubject.Teacher.User.FullName,
                    SubjectName = c.TeacherSubject.Subject.SubjectName
                }).FirstOrDefaultAsync();

            return (result, "SUCCESS");


        }

        public async Task<(CourseResponse? data, string? message)> UpdateCourse(CreateCourseRequest request, Guid courseId, Guid userId)
        {

            var teacherId = await context.Teacher.AsNoTracking().Where(x => x.UserId == userId)
                                                     .Select(g => g.Id)
                                                     .FirstOrDefaultAsync();

            if (teacherId == Guid.Empty) return (null, "NOT_FOUND_TEACHER"); 

            var course = await context.Course.Include(x => x.TeacherSubject).FirstOrDefaultAsync(x => x.Id == courseId);
            if (course == null) return (null, "NOT_FOUND_COURSE");
            if (course.TeacherSubject.TeacherId != teacherId) return (null, "FORBIDDEN");

            var teacherSubjectInfo = await context.TeacherSubject.AsNoTracking()
                                                                              .Where(x => x.TeacherId == teacherId && x.SubjectId == request.SubjectId)
                                                                              .Select(g => new { g.TeacherSubjectId, g.Teacher.User.FullName, g.Subject.SubjectName })
                                                                              .FirstOrDefaultAsync();
            if (teacherSubjectInfo == null) return (null, "NOT_FOUND_TEACHERSUBJECTID");
            var isExisted = await context.Course.AnyAsync(x => x.CourseName.Trim().ToLower() == request.CourseName.Trim().ToLower() && x.TeacherSubject.TeacherId == teacherId && x.Id != courseId);
            if (isExisted) return (null, "DUPLICATED_COURSENAME");

            if (request.Price < 0) return (null, "UNCORRECT_PRICE");

            course.CourseName = request.CourseName;
            course.Price = request.Price;
            course.Description = request.Description;
            course.TeacherSubjectId = teacherSubjectInfo.TeacherSubjectId;

            await context.SaveChangesAsync();
            return (new CourseResponse
            {
                Id = course.Id,
                Description = course.Description,
                CourseName = course.CourseName,
                CreatedAt = course.CreatedAt,
                Price = course.Price,
                Status = course.Status,
                PublishedAt = course.PublishedAt,
                SubjectName = teacherSubjectInfo.SubjectName,
                TeacherSubjectId = course.TeacherSubjectId,
                TeacherName = teacherSubjectInfo.FullName
            }, "SUCCESS");

        }
    }
}

using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using System.Security.Claims;

namespace School_Management.API.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository studentRepository;
        private readonly UserManager<AppUser> userManager;
        private readonly ApplicationDbContext context;

        public StudentService(IStudentRepository studentRepository, UserManager<AppUser> userManager, ApplicationDbContext context)
        {
            this.studentRepository = studentRepository;
            this.userManager = userManager;
            this.context = context;
        }

        public async Task<StudentInfoResponse> ChangeClassForStudent(ChangeClassRequest changeClassRequest, Guid studentId)
        {
            var requestClassYearId = changeClassRequest.classYearId;
            var userId = await studentRepository.GetUserIdByStudentId(studentId);
            if (userId == Guid.Empty) throw new NotFoundException("Người dùng không tồn tại");
            var user = await userManager.FindByIdAsync(userId.ToString());
            var currentClassRelation = await studentRepository.GetClassRelationByStudentId(studentId);
            if (currentClassRelation == null)
                throw new NotFoundException("Học sinh này không có lớp để thay đổi");
            if(currentClassRelation.ClassYearId != requestClassYearId)
            {
                currentClassRelation.ClassYearId = (Guid)requestClassYearId;
            }

            await context.SaveChangesAsync();
            return new StudentInfoResponse
            {
                Address = user.Address,
                Birthday = user.Birthday,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                StudentId = studentId,
                UserId = user.Id,
                ClassYearSub = await context.StudentClassYear
                                         .Where(x => x.StudentId == studentId)
                                         .OrderByDescending(x => x.ClassYear.SchoolYear)
                                         .Select(x => new ClassYearSub
                                         {
                                             ClassName = x.ClassYear.ClassName,
                                             Grade = x.ClassYear.Grade,
                                             SchoolYear = x.ClassYear.SchoolYear
                                         }).ToListAsync()
            };
        }

        public async Task<PagedResponse<StudentListResponse>> GetAllStudent(StudentFilterRequest request)
        {
            return await studentRepository.GetAllStudent(request);
        }

        public async Task<StudentInfoResponse> GetMyProfileForStudent(Guid userId)
        {
            var result = await studentRepository.GetMyProfileForStudent(userId);
            if (result == null) throw new NotFoundException("Người dùng không tồn tại");
            return result;
        }

        public async Task<StudentInfoResponse> GetStudentById(Guid studentId)
        {
            var result = await studentRepository.GetStudentById(studentId);
            if (result == null) throw new NotFoundException("Học sinh không tồn tại");
            return result;
        }

        public async Task<StudentInfoResponse> UpdateMyProfileForStudent(UpdateUserRequest updateUserRequest, Guid userId)
        {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            if (updateUserRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!eResult.Succeeded)
                {
                    throw new BadRequestException("Cập nhật email thất bại");
                }
            }

            user.FullName = updateUserRequest.FullName ?? user.FullName;
            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            if (updateUserRequest.Birthday != null)
            {
                if (DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date))
                    user.Birthday = date.ToUniversalTime();
            }

            var studentId = await studentRepository.GetStudentIdByUserId(userId);
            if (studentId == Guid.Empty) throw new NotFoundException("Học sinh không tồn tại");

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Cập nhật thất bại");

            return new StudentInfoResponse
            {
                Address = user.Address,
                Birthday = user.Birthday,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                StudentId = studentId,
                UserId = user.Id,
                ClassYearSub = await context.StudentClassYear
                                         .Where(x => x.StudentId == studentId)
                                         .OrderByDescending(x => x.ClassYear.SchoolYear)
                                         .Select(x => new ClassYearSub
                                         {
                                             ClassName = x.ClassYear.ClassName,
                                             Grade = x.ClassYear.Grade,
                                             SchoolYear = x.ClassYear.SchoolYear
                                         }).ToListAsync()
            };
        }

        public async Task<StudentInfoResponse> UpdateStudentByAdminOrTeacher(UpdateUserRequest updateUserRequest, Guid studentId, ClaimsPrincipal currentUser)
        {
            var userId = await studentRepository.GetUserIdByStudentId(studentId);
            if (userId == Guid.Empty) throw new NotFoundException("Học sinh không tồn tại");

            var user = await userManager.FindByIdAsync(userId.ToString());

            if(currentUser.IsInRole("Teacher"))
            {
                var userOfTeacherId = Guid.Parse(currentUser.FindFirstValue(ClaimTypes.NameIdentifier));
                var teacherId = await studentRepository.GetTeacherIdByUserId(userOfTeacherId);
                var homeRoomId = await studentRepository.GetHomeRoomId(studentId);
                if (teacherId != homeRoomId) throw new ForbiddenException("Bạn không là giáo viên chủ nhiệm của lớp này");
            }

            if(updateUserRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if(!eResult.Succeeded)
                {
                    throw new BadRequestException("Cập nhật email thất bại");
                }
            }

            user.FullName = updateUserRequest.FullName ?? user.FullName;
            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            if(updateUserRequest.Birthday != null)
            {
                if (DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date))
                    user.Birthday = date.ToUniversalTime();
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Cập nhật thất bại");

            return new StudentInfoResponse
            {
                Address = user.Address,
                Birthday = user.Birthday,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                StudentId = studentId,
                UserId = user.Id,
                ClassYearSub = await context.StudentClassYear
                                         .Where(x => x.StudentId == studentId)
                                         .OrderByDescending(x => x.ClassYear.SchoolYear)
                                         .Select(x => new ClassYearSub
                                         {
                                             ClassName = x.ClassYear.ClassName,
                                             Grade = x.ClassYear.Grade,
                                             SchoolYear = x.ClassYear.SchoolYear
                                         }).ToListAsync()
            };
        }
    }
}

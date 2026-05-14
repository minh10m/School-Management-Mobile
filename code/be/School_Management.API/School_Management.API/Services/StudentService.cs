using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
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
        private readonly Cloudinary cloudinary;

        public StudentService(IStudentRepository studentRepository, UserManager<AppUser> userManager, ApplicationDbContext context, Cloudinary cloudinary)
        {
            this.studentRepository = studentRepository;
            this.userManager = userManager;
            this.context = context;
            this.cloudinary = cloudinary;
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
                var schoolYear = await context.ClassYear.AsNoTracking().Where(x => x.Id == requestClassYearId).Select(x => x.SchoolYear).FirstOrDefaultAsync();
                var isExisted = await context.StudentClassYear.AnyAsync(x => x.StudentId == studentId && x.SchoolYear == schoolYear);
                if (isExisted) throw new ConflictException("Học sinh đã tồn tại lớp trong năm học này rồi, vui lòng chọn lớp năm học khác");
                currentClassRelation.ClassYearId = (Guid)requestClassYearId;
                currentClassRelation.SchoolYear = schoolYear;
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
                AvatarUrl = user.AvatarUrl,
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

            string? avatarUrl = user.AvatarUrl;
            string? publicId = user.PublicId;

            if (updateUserRequest.Avatar != null && updateUserRequest.Avatar.Length > 0)
            {
                if (updateUserRequest.Avatar.Length > 2 * 1024 * 1024)
                    throw new BadRequestException("Ảnh không được quá 2MB");

                if (!string.IsNullOrEmpty(user.PublicId))
                {
                    var deletionParams = new DeletionParams(user.PublicId)
                    {
                        ResourceType = ResourceType.Image // Đảm bảo xóa đúng loại ảnh
                    };
                    var deletionResult = await cloudinary.DestroyAsync(deletionParams);
                }

                // --- BƯỚC 2: UPLOAD ẢNH MỚI ---
                using var stream = updateUserRequest.Avatar.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(updateUserRequest.Avatar.FileName, stream),
                    Folder = "avatars",
                    PublicId = Guid.NewGuid().ToString(),
                    Transformation = new Transformation().Width(500).Height(500).Crop("fill") // Tip: Nén ảnh luôn
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                    throw new Exception("Lỗi khi upload ảnh lên Cloudinary");

                avatarUrl = uploadResult.SecureUrl.ToString();
                publicId = uploadResult.PublicId;
            }

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
            user.AvatarUrl = avatarUrl;
            user.PublicId = publicId;
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
                AvatarUrl = user.AvatarUrl,
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

            string? avatarUrl = user.AvatarUrl;
            string? publicId = user.PublicId;

            if (updateUserRequest.Avatar != null && updateUserRequest.Avatar.Length > 0)
            {
                if (updateUserRequest.Avatar.Length > 2 * 1024 * 1024)
                    throw new BadRequestException("Ảnh không được quá 2MB");

                if (!string.IsNullOrEmpty(user.PublicId))
                {
                    var deletionParams = new DeletionParams(user.PublicId)
                    {
                        ResourceType = ResourceType.Image // Đảm bảo xóa đúng loại ảnh
                    };
                    var deletionResult = await cloudinary.DestroyAsync(deletionParams);
                }

                // --- BƯỚC 2: UPLOAD ẢNH MỚI ---
                using var stream = updateUserRequest.Avatar.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(updateUserRequest.Avatar.FileName, stream),
                    Folder = "avatars",
                    PublicId = Guid.NewGuid().ToString(),
                    Transformation = new Transformation().Width(500).Height(500).Crop("fill") // Tip: Nén ảnh luôn
                };

                var uploadResult = await cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                    throw new Exception("Lỗi khi upload ảnh lên Cloudinary");

                avatarUrl = uploadResult.SecureUrl.ToString();
                publicId = uploadResult.PublicId;
            }

            if (currentUser.IsInRole("Teacher"))
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
            user.AvatarUrl = avatarUrl;
            user.PublicId = publicId;

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
                AvatarUrl = user.AvatarUrl,
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

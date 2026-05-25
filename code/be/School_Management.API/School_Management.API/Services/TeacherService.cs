using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly ITeacherRepository teacherRepository;
        private readonly UserManager<AppUser> userManager;
        private readonly ApplicationDbContext context;
        private readonly Cloudinary cloudinary;
        private readonly ILogger<TeacherService> logger;

        public TeacherService(ITeacherRepository teacherRepository, UserManager<AppUser> userManager, ApplicationDbContext context, Cloudinary cloudinary, ILogger<TeacherService> logger)
        {
            this.teacherRepository = teacherRepository;
            this.userManager = userManager;
            this.context = context;
            this.cloudinary = cloudinary;
            this.logger = logger;
        }
        public async Task<PagedResponse<TeacherListResponse>> GetAllTeacher(TeacherFilterRequest request)
        {
            return await teacherRepository.GetAllTeacher(request);
        }

        public async Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId)
        {
            var result = await teacherRepository.GetMyProfileForTeacher(userId);
            if (result == null) throw new NotFoundException("Giáo viên không tồn tại");
            return result;
        }

        public async Task<TeacherInfoResponse> GetTeacherById(Guid teacherId)
        {
            var result = await teacherRepository.GetTeacherById(teacherId);
            if (result == null) throw new NotFoundException("Giáo viên không tồn tại");
            return result;
        }

        public async Task<TeacherInfoResponse> UpdateMyProfileForTeacher(UpdateUserRequest updateUserRequest, Guid userId)
        {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new NotFoundException("Giáo viên không tồn tại");

            string? avatarUrl = user.AvatarUrl;
            string? publicId = user.PublicId;
            string? oldPublicId = user.PublicId;

            if (updateUserRequest.Avatar != null && updateUserRequest.Avatar.Length > 0)
            {
                if (updateUserRequest.Avatar.Length > 2 * 1024 * 1024)
                    throw new BadRequestException("Ảnh không được quá 2MB");

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

                if (!string.IsNullOrEmpty(oldPublicId))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var deletionParams = new DeletionParams(oldPublicId) { ResourceType = ResourceType.Image };
                            await cloudinary.DestroyAsync(deletionParams);
                            logger.LogInformation("Xóa ảnh thành công");
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "Không thể xóa ảnh cũ trên Cloudinary");
                        }
                    });
                }

            }

            if (updateUserRequest.Email != null)
            {
                var result = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!result.Succeeded) throw new BadRequestException("Cập nhật email thất bại");

            }

<<<<<<< HEAD
            if (updateUserRequest.Address != null && string.IsNullOrWhiteSpace(updateUserRequest.Address)) throw new BadRequestException("Địa chỉ không được phép bỏ trống");


=======
>>>>>>> c61e4ab (fix be)
            user.FullName = updateUserRequest.FullName ?? user.FullName;
            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            user.AvatarUrl = avatarUrl;
            user.PublicId = publicId;
            if (updateUserRequest.Birthday != null)
            {
                DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date);
                user.Birthday = date.ToUniversalTime();
            }
            var resultF = await userManager.UpdateAsync(user);
            if (!resultF.Succeeded) throw new BadRequestException("Cập nhật thất bại");
            return await teacherRepository.ReturnData(user, await teacherRepository.GetTeacherIdByUserId(user.Id));
        }

        public async Task<TeacherInfoResponse> UpdateTeacherForAdmin(UpdateUserRequest updateUserRequest, Guid teacherId)
        {
            var userId = await teacherRepository.GetUserIdByTeacherid(teacherId);
            if (userId == Guid.Empty) throw new NotFoundException("Giáo viên không tồn tại");
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new NotFoundException("Giáo viên không tồn tại");

            string? avatarUrl = user.AvatarUrl;
            string? publicId = user.PublicId;
            string? oldPublicId = user.PublicId;

            if (updateUserRequest.Avatar != null && updateUserRequest.Avatar.Length > 0)
            {
                if (updateUserRequest.Avatar.Length > 2 * 1024 * 1024)
                    throw new BadRequestException("Ảnh không được quá 2MB");

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

                if (!string.IsNullOrEmpty(oldPublicId))
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            var deletionParams = new DeletionParams(oldPublicId) { ResourceType = ResourceType.Image };
                            await cloudinary.DestroyAsync(deletionParams);
                            logger.LogInformation("Xóa ảnh thành công");
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "Không thể xóa ảnh cũ trên Cloudinary");
                        }
                    });
                }

            }

            if (updateUserRequest.Email != null)
            {
                var result = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!result.Succeeded) throw new BadRequestException("Cập nhật email thất bại");

            }

<<<<<<< HEAD
            if (updateUserRequest.Address != null && string.IsNullOrWhiteSpace(updateUserRequest.Address)) throw new BadRequestException("Địa chỉ không được phép bỏ trống");

=======
>>>>>>> c61e4ab (fix be)
            user.FullName = updateUserRequest.FullName ?? user.FullName;
            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            user.AvatarUrl = avatarUrl;
            user.PublicId = publicId;
            if(updateUserRequest.Birthday != null)
            {
                DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date);
                user.Birthday = date.ToUniversalTime();
            }
            var resultF = await userManager.UpdateAsync(user);
            if (!resultF.Succeeded) throw new BadRequestException("Cập nhật thất bại");
            return await teacherRepository.ReturnData(user, teacherId);
        }
    }
}

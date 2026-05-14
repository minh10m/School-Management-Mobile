using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Data;

namespace School_Management.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<AppUser> userManager;
        private readonly ApplicationDbContext context;
        private readonly Cloudinary cloudinary;

        public UserService(UserManager<AppUser> userManager, ApplicationDbContext context, Cloudinary cloudinary)
        {
            this.userManager = userManager;
            this.context = context;
            this.cloudinary = cloudinary;
        }

        public async Task<UserStatusResponse> ChangeStatusOfAccount(string userId)
        {
            //Check User
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            //The account is unlocked that it will be locked
            if (user.LockoutEnd == null || user.LockoutEnd < DateTimeOffset.UtcNow)
            {
                var lockoutEnd = new DateTimeOffset(2126, 1, 1, 0, 0, 0, TimeSpan.Zero);
                await userManager.SetLockoutEndDateAsync(user, lockoutEnd);
                await userManager.UpdateSecurityStampAsync(user);
                return new UserStatusResponse
                {
                    UserId = user.Id, 
                    LockoutEnd = lockoutEnd,
                    Message = "Khóa tài khoản thành công"
                };
            }

            //The account is locked that it will be unlocked
            await userManager.SetLockoutEndDateAsync(user, null);
            await userManager.ResetAccessFailedCountAsync(user);
            return new UserStatusResponse
            {
                UserId = user.Id,
                LockoutEnd = null,
                Message = "Mở khóa tài khoản thành công"
            };

        }

        //done
        public async Task<UserInfoResponse> GetMyProfileForAdmin(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            var role = await userManager.GetRolesAsync(user);
            return ReturnData(user, role.FirstOrDefault());
        }

        //done
        public async Task<UserInfoResponse> GetUserById(string UserId)
        {
            var user = await userManager.FindByIdAsync(UserId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            var role = await userManager.GetRolesAsync(user);
            return ReturnData(user, role.FirstOrDefault());
        }

        public async Task ResetPassword(ResetPasswordRequest resetPasswordRequest, string userId)
        {
            //Find user by id
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            // Generate resetToken for admin
            var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
            var result = await userManager.ResetPasswordAsync(user, resetToken, resetPasswordRequest.NewPassword);
            if(!result.Succeeded)
            {
                var error = result.Errors.FirstOrDefault();
                throw new BadRequestException("Vui lòng thử lại với mật khẩu khác với chữ hoa, thường, kí tự đặc biệt và ít nhất 8 kí tự");
            }

            // Log out this account in other devices
            await userManager.UpdateSecurityStampAsync(user);
        }

        public async Task<UserInfoResponse> UpdateMyProfileForAdmin(UpdateAdminRequest updateAdminRequest, string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            string? avatarUrl = user.AvatarUrl;
            string? publicId = user.PublicId;

            if (updateAdminRequest.Avatar != null && updateAdminRequest.Avatar.Length > 0)
            {
                if (updateAdminRequest.Avatar.Length > 2 * 1024 * 1024)
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
                using var stream = updateAdminRequest.Avatar.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(updateAdminRequest.Avatar.FileName, stream),
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

            if (updateAdminRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateAdminRequest.Email);
                if (!eResult.Succeeded) throw new BadRequestException("Cập nhật email thất bại");
            }

            user.PhoneNumber = updateAdminRequest.PhoneNumber ?? user.PhoneNumber;
            user.FullName = updateAdminRequest.FullName ?? user.FullName;
            user.AvatarUrl = avatarUrl;
            user.PublicId = publicId;
            
            if(updateAdminRequest.Birthday != null)
            {
                if (DateTimeOffset.TryParse(updateAdminRequest.Birthday, out var date))
                    user.Birthday = date.ToUniversalTime();
            }
            user.Address = updateAdminRequest.Address ?? user.Address;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Cập nhật thất bại");

            var role = await userManager.GetRolesAsync(user);

            return ReturnData(user, role.FirstOrDefault());

        }

        public async Task<UserInfoResponse> UpdateRoleForUser(ChangeRoleRequest updateRoleRequest, string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            var currentRole = await userManager.GetRolesAsync(user);
            if(updateRoleRequest.Role != null && currentRole.Contains(updateRoleRequest.Role.Trim()))
            {
                return ReturnData(user, currentRole.FirstOrDefault());
            }

            await userManager.RemoveFromRolesAsync(user, currentRole);
            if(updateRoleRequest.Role != null)
            {
                var result = await userManager.AddToRoleAsync(user, updateRoleRequest.Role);
                if (!result.Succeeded)
                    throw new BadRequestException("Cập nhật vai trò thất bại");
            }

            return ReturnData(user, updateRoleRequest.Role);
        }

        public async Task<UserInfoResponse> UpdateUser(UpdateUserRequest updateUserRequest, string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
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
                if (!eResult.Succeeded) throw new BadRequestException("Cập nhật email thất bại");
            }

            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            user.AvatarUrl = avatarUrl;
            user.PublicId = publicId;
            if(updateUserRequest.Birthday != null)
            {
                if (DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date))
                    user.Birthday = date.ToUniversalTime();
            }    
            user.FullName = updateUserRequest.FullName ?? user.FullName;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Cập nhật thất bại");
            var role = await userManager.GetRolesAsync(user);
            return ReturnData(user, role.FirstOrDefault());
        }

        //Method in order to map data
        public UserInfoResponse ReturnData(AppUser user, string? role)
        {
            return new UserInfoResponse
            {

                UserId = user.Id,
                UserName = user.UserName,
                Address = user.Address,
                Birthday = user.Birthday,
                Email = user.Email,
                FullName = user.FullName,
                LockoutEnd = user.LockoutEnd,
                AvatarUrl = user.AvatarUrl,
                PhoneNumber = user.PhoneNumber,
                Role = role
            };

        }

        public UserListResponse ReturnListData(AppUser user, string? role)
        {
            return new UserListResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                FullName = user.FullName,
                LockoutEnd = user.LockoutEnd,
                AvatarUrl = user.AvatarUrl,
                Role = role,
                CreatedAt = user.CreatedAt
            };
        }

        //done
        public async Task<PagedResponse<UserListResponse>> GetAllUser(UserFilterRequest request)
        {
            // 1. Khởi tạo query kết hợp bảng ngay từ đầu để lấy Role
            // Dùng Left Join (DefaultIfEmpty) để tránh mất User nếu họ chưa được gán Role
            var query = from user in context.Users
                        join userRole in context.UserRoles on user.Id equals userRole.UserId into ur
                        from userRole in ur.DefaultIfEmpty()
                        join role in context.Roles on userRole.RoleId equals role.Id into r
                        from role in r.DefaultIfEmpty()
                        select new { user, roleName = role.Name };

            // 2. Filtering
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                var name = request.FullName.Trim().ToLower();
                query = query.Where(x => x.user.FullName.Trim().ToLower().Contains(name));
            }    

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var email = request.Email.Trim().ToLower();
                query = query.Where(x => x.user.Email.Trim().ToLower().Contains(email));
            }

            if (!string.IsNullOrWhiteSpace(request.Address))
                query = query.Where(x => x.user.Address.Contains(request.Address));

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                query = query.Where(x => x.roleName.ToLower().Trim() == request.Role.ToLower().Trim());
            }

            // 3. Sorting (Sử dụng x.user để truy cập thuộc tính)
            if (!string.IsNullOrWhiteSpace(request.SortBy))
            {
                query = request.SortBy.ToLower() switch
                {
                    "fullname" => request.IsAscending ? query.OrderBy(x => x.user.FullName) : query.OrderByDescending(x => x.user.FullName),
                    "address" => request.IsAscending ? query.OrderBy(x => x.user.Address) : query.OrderByDescending(x => x.user.Address),
                    "email" => request.IsAscending ? query.OrderBy(x => x.user.Email) : query.OrderByDescending(x => x.user.Email),
                    "birthday" => request.IsAscending ? query.OrderBy(x => x.user.Birthday) : query.OrderByDescending(x => x.user.Birthday),
                    "createdat" => request.IsAscending ? query.OrderBy(x => x.user.CreatedAt) : query.OrderByDescending(x => x.user.CreatedAt),
                    _ => query.OrderBy(x => x.user.FullName) // Mặc định
                };
            }
            else
            {
                query = query.OrderBy(x => x.user.FullName);
            }

            // 4. Count và Pagination
            var totalCount = await query.CountAsync();
            var skipResults = (request.PageNumber - 1) * request.PageSize;

            // 5. Select trực tiếp ra DTO để không còn vòng lặp foreach gọi DB nữa
            var items = await query
                .Skip(skipResults)
                .Take(request.PageSize)
                .Select(x => new UserListResponse
                {
                    UserId = x.user.Id,
                    UserName = x.user.UserName,
                    FullName = x.user.FullName,
                    LockoutEnd = x.user.LockoutEnd,
                    AvatarUrl = x.user.AvatarUrl,
                    Role = x.roleName,
                    CreatedAt = x.user.CreatedAt
                })
                .ToListAsync();

            return new PagedResponse<UserListResponse>
            {
                Items = items,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalCount = totalCount
            };
        }
        public async Task<UserInfoResponse> CreateUser(CreateUserRequest createUserRequest)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                DateTimeOffset.TryParse(createUserRequest.Birthday, out var birthday);
                string? avatarUrl = null;
                string? publicId = null;
                if (createUserRequest.Avatar != null)
                {
                    var maxSize = 2 * 1024 * 1024;

                    if (createUserRequest.Avatar.Length > maxSize)
                        throw new BadRequestException("Ảnh đại diện không được quá 2MB");

                    if (createUserRequest.Avatar.Length > 0)
                    {
                        using var stream = createUserRequest.Avatar.OpenReadStream();

                        var uploadParams = new ImageUploadParams
                        {
                            File = new FileDescription(createUserRequest.Avatar.FileName, stream),
                            Folder = "avatars",
                            PublicId = Guid.NewGuid().ToString(),
                            Type = "upload",
                            Transformation = new Transformation().Width(400).Height(400).Crop("fill").Gravity("face"),
                            AccessMode = "public"
                        };

                        var uploadResult = await cloudinary.UploadAsync(uploadParams);

                        if (uploadResult.Error != null)
                            throw new Exception("Lỗi hệ thống");

                        avatarUrl = uploadResult.SecureUrl.ToString();
                        publicId = uploadResult.PublicId;
                    }
                }
                //User
                var user = new AppUser
                {
                    UserName = createUserRequest.Username,
                    Address = createUserRequest.Address,
                    PhoneNumber = createUserRequest.PhoneNumber,
                    Birthday = birthday.ToUniversalTime(),
                    FullName = createUserRequest.FullName,
                    Email = createUserRequest.Email,
                    AvatarUrl = avatarUrl ?? "",
                    PublicId = publicId ?? "",
                    EmailConfirmed = true
                };
                var cResult = await userManager.CreateAsync(user, createUserRequest.Password);
                if(!cResult.Succeeded)
                {
                    var error = cResult.Errors.FirstOrDefault().Description ?? "Tạo thất bại";
                    throw new BadRequestException(error);
                }
                
                //Role
                var rResult = await userManager.AddToRoleAsync(user, createUserRequest.Role);
                if(!rResult.Succeeded)
                {
                    var error = rResult.Errors.FirstOrDefault().Description ?? "Tạo thất bại";
                    throw new BadRequestException(error);
                }

                if(createUserRequest.Role.Equals("Teacher", StringComparison.OrdinalIgnoreCase))
                {
                    var teacher = new Teacher
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id
                    };
                    await context.Teacher.AddAsync(teacher);
                    if (createUserRequest.SubjectId != null)
                    {
                        var teacherSubjects = new List<TeacherSubject>();
                        foreach (var item in createUserRequest.SubjectId)
                        {
                            var teacherSubject = new TeacherSubject
                            {
                                TeacherSubjectId = Guid.NewGuid(),
                                SubjectId = item,
                                TeacherId = teacher.Id
                            };
                            teacherSubjects.Add(teacherSubject);
                            
                        }
                        await context.TeacherSubject.AddRangeAsync(teacherSubjects);

                    }
                        
                }
                if (createUserRequest.Role.Equals("Student", StringComparison.OrdinalIgnoreCase))
                {
                    var student = new Student 
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id
                    };
                    await context.Student.AddAsync(student);

                    if (createUserRequest.ClassYearId != null)
                    {
                        var schoolYear = await context.ClassYear.AsNoTracking().Where(x => x.Id == createUserRequest.ClassYearId).Select(x => x.SchoolYear).FirstOrDefaultAsync();
                        var isExisted = await context.StudentClassYear.AnyAsync(x => x.StudentId == student.Id && x.SchoolYear == schoolYear);
                        if (isExisted) throw new ConflictException("Học sinh đã tồn tại lớp trong năm học này rồi");
                        await context.AddAsync(new StudentClassYear
                        {
                            StudentClassYearId = Guid.NewGuid(),
                            ClassYearId = (Guid)createUserRequest.ClassYearId,
                            StudentId = student.Id,
                            SchoolYear = schoolYear
                        });
                    }
                    
                }



                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return ReturnData(user, createUserRequest.Role);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

    }
}

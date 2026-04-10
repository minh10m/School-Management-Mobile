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

        public UserService(UserManager<AppUser> userManager, ApplicationDbContext context)
        {
            this.userManager = userManager;
            this.context = context;
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

        public async Task<UserInfoResponse> GetMyProfileForAdmin(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("Người dùng không tồn tại");

            var role = await userManager.GetRolesAsync(user);
            return ReturnData(user, role.FirstOrDefault());
        }

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

            if(updateAdminRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateAdminRequest.Email);
                if (!eResult.Succeeded) throw new BadRequestException("Cập nhật email thất bại");
            }

            user.PhoneNumber = updateAdminRequest.PhoneNumber ?? user.PhoneNumber;
            user.FullName = updateAdminRequest.FullName ?? user.FullName;
            
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

            if(updateUserRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!eResult.Succeeded) throw new BadRequestException("Cập nhật email thất bại");
            }

            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
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
                Role = role,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<PagedResponse<UserListResponse>> GetAllUser(UserFilterRequest request)
        {
            var query = userManager.Users.AsQueryable();

            // Filtering
            if(!string.IsNullOrWhiteSpace(request.FullName))
                query = query.Where(x => x.FullName.Contains(request.FullName));

            if (!string.IsNullOrWhiteSpace(request.Email))
                query = query.Where(x => x.FullName.Contains(request.Email));

            if (!string.IsNullOrWhiteSpace(request.Address))
                query = query.Where(x => x.FullName.Contains(request.Address));

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                query = from user in query
                        join userRole in context.UserRoles on user.Id equals userRole.UserId
                        join role in context.Roles on userRole.RoleId equals role.Id
                        where role.Name.ToLower() == request.Role.ToLower()
                        select user;
            }
            

            //Sorting
            if(!string.IsNullOrWhiteSpace(request.SortBy))
            {
                if(request.SortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.FullName) : query.OrderByDescending(x => x.FullName);
                }
                else if(request.SortBy.Equals("Address", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.Address) : query.OrderByDescending(x => x.Address);
                }
                else if(request.SortBy.Equals("Email", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.Email) : query.OrderByDescending(x => x.Email);
                }
                else if(request.SortBy.Equals("Birthday", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.Birthday) : query.OrderByDescending(x => x.Birthday);
                }
                else if (request.SortBy.Equals("CreatedAt", StringComparison.OrdinalIgnoreCase))
                {
                    query = request.IsAscending ? query.OrderBy(x => x.CreatedAt) : query.OrderByDescending(x => x.CreatedAt);
                }
            }
            var totalCount = await query.CountAsync();

            //Pagination
            var skipResults = (request.PageNumber - 1) * request.PageSize;
            var users = await query.Skip(skipResults).Take(request.PageSize).ToListAsync();

            var items = new List<UserListResponse>();
            foreach (var user in users)
            {
                var roles = await userManager.GetRolesAsync(user);
                items.Add(ReturnListData(user, roles.FirstOrDefault()));
            }

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
                //User
                var user = new AppUser
                {
                    UserName = createUserRequest.Username,
                    Address = createUserRequest.Address,
                    PhoneNumber = createUserRequest.PhoneNumber,
                    Birthday = birthday.ToUniversalTime(),
                    FullName = createUserRequest.FullName,
                    Email = createUserRequest.Email,
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

                    if(createUserRequest.ClassYearId != null)
                        await context.AddAsync(new StudentClassYear
                        {
                            StudentClassYearId = Guid.NewGuid(),
                            ClassYearId = (Guid)createUserRequest.ClassYearId,
                            StudentId = student.Id
                        });
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

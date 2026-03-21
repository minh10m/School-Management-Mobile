using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.Data;

namespace School_Management.API.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<AppUser> userManager;

        public UserService(UserManager<AppUser> userManager)
        {
            this.userManager = userManager;
        }

        public async Task<UserStatusResponse> ChangeStatusOfAccount(string userId)
        {
            //Check User
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("User is invalid!");

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
                    Message = "Locked account successfully!"
                };
            }

            //The account is locked that it will be unlocked
            await userManager.SetLockoutEndDateAsync(user, null);
            await userManager.ResetAccessFailedCountAsync(user);
            return new UserStatusResponse
            {
                UserId = user.Id,
                LockoutEnd = null,
                Message = "Unlocked account successfully!"
            };

        }

        public async Task<UserInfoResponse> GetMyProfileForAdmin(string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("User is invalid!");

            var role = await userManager.GetRolesAsync(user);
            return ReturnData(user, role.FirstOrDefault());
        }

        public async Task<UserInfoResponse> GetUserById(string UserId)
        {
            var user = await userManager.FindByIdAsync(UserId);
            if (user == null) throw new NotFoundException("User is invalid!");

            var role = await userManager.GetRolesAsync(user);
            return ReturnData(user, role.FirstOrDefault());
        }

        public async Task ResetPassword(ResetPasswordRequest resetPasswordRequest, string userId)
        {
            //Find user by id
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("User is invalid!");

            // Generate resetToken for admin
            var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
            var result = await userManager.ResetPasswordAsync(user, resetToken, resetPasswordRequest.NewPassword);
            if(!result.Succeeded)
            {
                var error = result.Errors.FirstOrDefault();
                throw new BadRequestException(error?.Description ?? "Change password failed!");
            }

            // Log out this account in other devices
            await userManager.UpdateSecurityStampAsync(user);
        }

        public async Task<UserInfoResponse> UpdateMyProfileForAdmin(UpdateAdminRequest updateAdminRequest, string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("User is invalid");

            if(updateAdminRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateAdminRequest.Email);
                if (!eResult.Succeeded) throw new BadRequestException("Update email failed");
            }

            user.PhoneNumber = updateAdminRequest.PhoneNumber ?? user.PhoneNumber;
            user.FullName = updateAdminRequest.FullName ?? user.FullName;
            
            if(updateAdminRequest.Birthday != null)
            {
                user.Birthday = DateTimeOffset.Parse(updateAdminRequest.Birthday).ToUniversalTime();
            }
            user.Address = updateAdminRequest.Address ?? user.Address;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Update failed");

            var role = await userManager.GetRolesAsync(user);

            return ReturnData(user, role.FirstOrDefault());

        }

        public async Task<UserInfoResponse> UpdateRoleForUser(UpdateRoleRequest updateRoleRequest, string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("User is invalid");

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
                    throw new BadRequestException("Update role failed");
            }


            return ReturnData(user, updateRoleRequest.Role);
        }

        public async Task<UserInfoResponse> UpdateUser(UpdateUserRequest updateUserRequest, string userId)
        {
            var user = await userManager.FindByIdAsync(userId);
            if (user == null) throw new NotFoundException("User is invalid!");

            if(updateUserRequest.Email != null)
            {
                var eResult = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!eResult.Succeeded) throw new BadRequestException("Update email failed!");
            }

            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            if(updateUserRequest.Birthday != null)
            {
                user.Birthday = DateTimeOffset.Parse(updateUserRequest.Birthday).ToUniversalTime();
            }    
            user.FullName = updateUserRequest.FullName ?? user.FullName;

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Update failed!");
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

        public UserListResponse ReturnListData(AppUser user)
        {
            return new UserListResponse
            {

                UserId = user.Id,
                UserName = user.UserName,
                FullName = user.FullName,
                LockoutEnd = user.LockoutEnd,
            };
        }

        public async Task<PagedResponse<UserListResponse>> GetAllUser(string? filterOn = null, string? filterQuery = null, string? sortBy = null, bool isAscending = true, int pageNumber = 1, int pageSize = 10)
        {
            var query = userManager.Users.AsQueryable();

            // Filtering
            if(!string.IsNullOrWhiteSpace(filterOn) && !string.IsNullOrWhiteSpace(filterQuery))
            {
                if(filterOn.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.FullName.Contains(filterQuery));
                }
                else if(filterOn.Equals("Email", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.Email.Contains(filterQuery));
                }
                else if(filterOn.Equals("Address", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.Address.Contains(filterQuery));
                }
                else if(filterOn.Equals("Role", StringComparison.OrdinalIgnoreCase))
                {
                    var userInRoles = await userManager.GetUsersInRoleAsync(filterQuery);
                    var userId = userInRoles.Select(x => x.Id).ToList();

                    query = query.Where(x => userId.Contains(x.Id));
                }
            }

            //Sorting
            if(!string.IsNullOrWhiteSpace(sortBy))
            {
                if(sortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isAscending ? query.OrderBy(x => x.FullName) : query.OrderByDescending(x => x.FullName);
                }
                else if(sortBy.Equals("Address", StringComparison.OrdinalIgnoreCase))
                {
                    query = isAscending ? query.OrderBy(x => x.Address) : query.OrderByDescending(x => x.Address);
                }
                else if(sortBy.Equals("Email", StringComparison.OrdinalIgnoreCase))
                {
                    query = isAscending ? query.OrderBy(x => x.Email) : query.OrderByDescending(x => x.Email);
                }
                else if(sortBy.Equals("Birthday", StringComparison.OrdinalIgnoreCase))
                {
                    query = isAscending ? query.OrderBy(x => x.Birthday) : query.OrderByDescending(x => x.Birthday);
                }
            }
            var totalCount = await query.CountAsync();

            //Pagination
            var skipResults = (pageNumber - 1) * pageSize;
            var result = await query.Skip(skipResults).Take(pageSize).ToListAsync();

            return new PagedResponse<UserListResponse>
            {
                Items = result.Select(x => ReturnListData(x)).ToList(),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };
                
            
        }
    }
}

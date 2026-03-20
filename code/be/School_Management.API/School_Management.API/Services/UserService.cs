using Microsoft.AspNetCore.Identity;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

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

        public async Task<UserInfoResponse> GetUserById(string UserId)
        {
            var user = await userManager.FindByIdAsync(UserId);
            if (user == null) throw new NotFoundException("User is invalid!");

            var role = await userManager.GetRolesAsync(user);
            return new UserInfoResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                FullName = user.FullName,
                Address = user.Address,
                Birthday = user.Birthday,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = role.FirstOrDefault()
            };
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

            if(updateUserRequest.Role != null)
            {
                var currentRole = await userManager.GetRolesAsync(user);
                await userManager.RemoveFromRolesAsync(user, currentRole);
                await userManager.AddToRoleAsync(user, updateUserRequest.Role);
            }

            var result = await userManager.UpdateAsync(user);
            if (!result.Succeeded) throw new BadRequestException("Update failed!");
            var role = await userManager.GetRolesAsync(user);
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
                Role = role.FirstOrDefault()
            };
        }
    }
}

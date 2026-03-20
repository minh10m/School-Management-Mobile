using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IUserService
    {
        //Reset password
        public Task ResetPassword(ResetPasswordRequest resetPasswordRequest, string userId);

        //Lock or unlock ones account
        public Task<UserStatusResponse> ChangeStatusOfAccount(string userId);

        //Get user by id
        public Task<UserInfoResponse> GetUserById(string UserId);

        public Task<UserInfoResponse> UpdateUser(UpdateUserRequest updateUserRequest, string userId);
        
    }
}

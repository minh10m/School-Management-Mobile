using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IUserService
    {
        public Task ResetPassword(ResetPasswordRequest resetPasswordRequest, string userId);

        //Lock or unlock ones account
        public Task<UserStatusResponse> ChangeStatusOfAccount(string userId);
        
    }
}

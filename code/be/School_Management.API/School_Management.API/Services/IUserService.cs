using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IUserService
    {
        public Task ResetPassword(ResetPasswordRequestDTO resetPasswordRequest, string userId);
        
    }
}

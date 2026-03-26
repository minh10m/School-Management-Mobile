using School_Management.API.Models.Domain;
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

        public Task<UserInfoResponse> GetMyProfileForAdmin(string userId);

        public Task<UserInfoResponse> UpdateMyProfileForAdmin(UpdateAdminRequest updateAdminRequest, string userId);

        public Task<UserInfoResponse> UpdateRoleForUser(ChangeRoleRequest updateRoleRequest, string userId);

        public Task<PagedResponse<UserListResponse>> GetAllUser(UserFilterRequest request);

        public Task<UserInfoResponse> CreateUser(CreateUserRequest createUserRequest);
        //Method in order to map data
        public UserInfoResponse ReturnData(AppUser user, string? role);
        public UserListResponse ReturnListData(AppUser user);

    }
}

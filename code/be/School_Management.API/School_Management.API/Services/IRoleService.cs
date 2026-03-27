using Microsoft.AspNetCore.Identity;
using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IRoleService
    {
        public Task<PagedResponse<RoleInfoResponse>> GetAllRoles(RoleFilterRequest request);
        public RoleInfoResponse ReturnData(IdentityRole<Guid> role);

        public Task<RoleInfoResponse> GetRoleById(string roleId);
    }
}

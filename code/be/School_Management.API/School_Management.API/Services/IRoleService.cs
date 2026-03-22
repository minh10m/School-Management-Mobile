using Microsoft.AspNetCore.Identity;
using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IRoleService
    {
        public Task<PagedResponse<RoleInfoResponse>> GetAllRoles(string? filterOn, string? filterQuery, string? sortBy, bool? isAscending, int pageNumber, int pageSize);
        public RoleInfoResponse ReturnData(IdentityRole<Guid> role);

        public Task<RoleInfoResponse> GetRoleById(string roleId);
    }
}

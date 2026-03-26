using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public class RoleService : IRoleService
    {
        private readonly UserManager<AppUser> userManager;
        private readonly RoleManager<IdentityRole<Guid>> roleManager;

        public RoleService(UserManager<AppUser> userManager, RoleManager<IdentityRole<Guid>> roleManager)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
        }
        public async Task<PagedResponse<RoleInfoResponse>> GetAllRoles(string? filterOn, string? filterQuery, string? sortBy, bool? isAscending, int pageNumber, int pageSize)
        {
            var query = roleManager.Roles.AsQueryable();

            //filtering
            if (!string.IsNullOrWhiteSpace(filterOn) && !string.IsNullOrWhiteSpace(filterQuery))
            {
                if (filterOn.Equals("Name", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(x => x.Name.Contains(filterQuery));
                }
            }

            //sorting
            if(!string.IsNullOrWhiteSpace(sortBy))
            {
                if(sortBy.Equals("Name", StringComparison.OrdinalIgnoreCase))
                {
                    query = Convert.ToBoolean(isAscending) ? query.OrderBy(x => x.Name) : query.OrderByDescending(x => x.Name);
                }
            }

            //pagination
            var totalCount = await query.CountAsync();
            var skipResults = (pageNumber - 1) * pageSize;
            var result = await query.Skip(skipResults).Take(pageSize).ToListAsync();

            return new PagedResponse<RoleInfoResponse>
            {
                Items = result.Select(x => ReturnData(x)).ToList(),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount
            };

        }

        public async Task<RoleInfoResponse> GetRoleById(string roleId)
        {
            var role = await roleManager.FindByIdAsync(roleId);
            if (role == null) throw new NotFoundException("Vai trò này (role) không tồn tại");

            return ReturnData(role);
        }

        public RoleInfoResponse ReturnData(IdentityRole<Guid> role)
        {
            return new RoleInfoResponse
            {
                Name = role.Name,
                NormalizedName = role.NormalizedName,
                RoleId = role.Id
            };
        }


    }
}

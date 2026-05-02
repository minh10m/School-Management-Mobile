using System.Threading.Tasks;
using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IDashboardService
    {
        Task<DashboardStatisticsResponse> GetAdminDashboardStatsAsync(int schoolYear);
    }
}

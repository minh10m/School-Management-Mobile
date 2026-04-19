using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface IAttendanceRepository
    {
        public Task<List<ClassAttendanceResponse>> GetClassAttendance(ClassAttendanceRequest request);
        public Task<StudentAttendanceResponse> GetStudentAttendance(StudentAttedanceRequest request, Guid studentId);
        public Task<List<WeeklyAttendanceResponse>> GetWeeklyAttendance(WeeklyAttendanceRequest request);

    }
}

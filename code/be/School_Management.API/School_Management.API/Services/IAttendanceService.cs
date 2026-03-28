using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface IAttendanceService
    {
        //Upsert method
        public Task<int> AttendanceCheck(AttendanceRequest request, Guid userId);

        public Task<List<ClassAttendanceResponse>> GetClassAttendance(ClassAttendanceRequest request, Guid userId);
        public Task<StudentAttendanceResponse> GetStudentAttendance(StudentAttedanceRequest request, Guid userId);
    }
}

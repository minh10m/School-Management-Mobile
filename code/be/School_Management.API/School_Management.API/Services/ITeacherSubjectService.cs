using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ITeacherSubjectService
    {
        public Task<TeacherSubjectResponse> AssignSubjectForTeacher(TeacherSubjectRequest request);
        public Task<TeacherSubjectResponse> UpdateSubjectAfterAssignForTeacher(UpdateTeacherSubjectRequest request);
    }
}

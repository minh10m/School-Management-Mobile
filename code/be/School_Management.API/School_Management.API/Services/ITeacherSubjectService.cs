using School_Management.API.Models.DTO;

namespace School_Management.API.Services
{
    public interface ITeacherSubjectService
    {
        public Task<TeacherSubjectResponse> AssignSubjectForTeacher(TeacherSubjectRequest request);
        public Task<TeacherSubjectResponse> UpdateSubjectAfterAssignForTeacher(UpdateTeacherSubjectRequest request);
        public Task<List<TeacherSubjectResponse>> GetTeacherSubjects(Guid teacherId);
        public Task<bool> DeleteTeacherSubject(Guid teacherSubjectId);
    }
}

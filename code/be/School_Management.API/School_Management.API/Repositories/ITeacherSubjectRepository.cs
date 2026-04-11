using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public interface ITeacherSubjectRepository
    {
        public Task<(TeacherSubjectResponse? data, string? errorCode)> AssignSubjectForTeacher(TeacherSubjectRequest request);
        public Task<(TeacherSubjectResponse? data, string? errorCode)> UpdateSubjectAfterAssignForTeacher(UpdateTeacherSubjectRequest request);
        public Task<List<TeacherSubjectResponse>> GetTeacherSubjects(Guid teacherId);
        public Task<bool> DeleteTeacherSubject(Guid teacherSubjectId);

    }
}

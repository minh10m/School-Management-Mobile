using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class TeacherSubjectService : ITeacherSubjectService
    {
        private readonly ITeacherSubjectRepository teacherSubjectRepository;

        public TeacherSubjectService(ITeacherSubjectRepository teacherSubjectRepository)
        {
            this.teacherSubjectRepository = teacherSubjectRepository;
        }

        public async Task<TeacherSubjectResponse> AssignSubjectForTeacher(TeacherSubjectRequest request)
        {
            var (result, errorCode) = await teacherSubjectRepository.AssignSubjectForTeacher(request);
            return errorCode switch
            {
                "SUCCESS" => result!,
                "DUPLICATE_SUBJECT" => throw new ConflictException("Giáo viên đã có môn học này rồi"),
                _ => throw new Exception("Lỗi hệ thống không xác định")
            };
        }

        public async Task<TeacherSubjectResponse> UpdateSubjectAfterAssignForTeacher(UpdateTeacherSubjectRequest request)
        {
            var (result, errorCode) = await teacherSubjectRepository.UpdateSubjectAfterAssignForTeacher(request);
            return errorCode switch
            {
                "SUCCESS" => result!,
                "NOT_FOUND_TEACHERSUBJECT" => throw new NotFoundException("Không tìm thấy giáo viên và môn học này"),
                "DUPLICATE_SUBJECT" => throw new ConflictException("Giáo viên đã có môn học này"),
                _ => throw new Exception("Lỗi hệ thống không xác định")
            };
        }
    }
}

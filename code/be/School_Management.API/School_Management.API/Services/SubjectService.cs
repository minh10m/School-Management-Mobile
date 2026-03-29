using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly ISubjectRepository subjectRepository;

        public SubjectService(ISubjectRepository subjectRepository)
        {
            this.subjectRepository = subjectRepository;
        }
        public async Task<SubjectResponse> CreateSubject(PostOrUpdateSubjectRequest request)
        {
            var result = await subjectRepository.CreateSubject(request);
            if (result == null) throw new ConflictException("Tên môn học này đã tồn tại");
            return result;
        }

        public async Task<SubjectResponse> UpdateSubject(PostOrUpdateSubjectRequest request, Guid subjectId)
        {
            var (data, errorCode) = await subjectRepository.UpdateSubject(request, subjectId);

            return errorCode switch
            {
                "NOT_FOUND" => throw new NotFoundException("Môn học không tồn tại"), 
                "DUPLICATE_NAME" => throw new ConflictException("Tên môn học tồn tại, cập nhật thất bại"), 
                _ => data!
            };
        }
    }
}

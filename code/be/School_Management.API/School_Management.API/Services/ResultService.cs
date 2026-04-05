using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using System.Runtime.InteropServices;

namespace School_Management.API.Services
{
    public class ResultService : IResultService
    {
        private readonly IResultRepository resultRepository;

        public ResultService(IResultRepository resultRepository)
        {
            this.resultRepository = resultRepository;
        }
        public async Task<bool> CreateResult(List<ResultRequest> requests)
        {
            var (result, message) = await resultRepository.CreateResult(requests);
            return message switch
            {
                "CONFLICT_TYPE" => throw new ConflictException("Loại điểm số đã tồn tại"),
                "DUPLICATED_TYPE" => throw new BadRequestException("Danh sách gửi lên có 2 loại điểm của một học sinh bị trùng nhau"),
                "SUCCESS" => result,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}

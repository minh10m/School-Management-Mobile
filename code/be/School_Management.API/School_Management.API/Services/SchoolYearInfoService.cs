using School_Management.API.Exceptions;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Services
{
    public class SchoolYearInfoService : ISchoolYearInfoService
    {
        private readonly ISchoolYearInfoRepository schoolYearInfoRepository;

        public SchoolYearInfoService(ISchoolYearInfoRepository schoolYearInfoRepository)
        {
            this.schoolYearInfoRepository = schoolYearInfoRepository;
        }
        public async Task<SchoolYearInfoResponse> CreateSchoolYearInfo(SchoolYearInfoRequest request)
        {
            var (result, message) = await schoolYearInfoRepository.CreateSchoolYearInfo(request);
            return message switch
            {
                "ONLY_ONE_RECORD" => throw new ForbiddenException("Bảng này đã tồn tại bản ghi rồi, vui lòng xóa đi để có thể tạo mới"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }

        public async Task<SchoolYearInfoResponse> GetSchoolYearInfo()
        {
            return await schoolYearInfoRepository.GetSchoolYearInfo();
        }

        public async Task<SchoolYearInfoResponse> UpdateSchoolYearInfo(SchoolYearInfoRequest request, Guid schoolYearInfoId)
        {
            var (result, message) = await schoolYearInfoRepository.UpdateSchoolYearInfo(request, schoolYearInfoId);
            return message switch
            {
                "NOT_FOUND_SCHOOLYEAR_INFO" => throw new NotFoundException("Không tìm thấy thông tin năm học và học kì này"),
                "SUCCESS" => result!,
                _ => throw new Exception("Lỗi không xác định")
            };
        }
    }
}

using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ClassYearFilterRequest : BaseRequest
    {

        public string? ClassName { get; set; }

        [Range(2000, 2100, ErrorMessage = "Năm học nằm trong khoảng từ 2000 tới 2100")]
        public int? SchoolYear { get; set; }

        [Range(10, 12, ErrorMessage = "Khối nằm trong khoảng từ 10 tới 12")]
        public int? Grade { get; set; }
    }
}

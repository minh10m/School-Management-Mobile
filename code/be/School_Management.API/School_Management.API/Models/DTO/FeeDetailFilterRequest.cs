using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class FeeDetailFilterRequest : BaseRequestSecond
    {
        public Guid? FeeId { get; set; }

        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Tên học sinh không được phép chứa khoảng trắng")]
        public string? StudentName { get; set; }
    }
}

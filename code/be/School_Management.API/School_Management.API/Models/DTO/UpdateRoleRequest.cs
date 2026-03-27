using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateRoleRequest
    {
        [MaxLength(100, ErrorMessage = "Tên quá dài")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Tên không được chứa kí tự đặc biệt hoặc là khoảng trắng")]
        public string? Name { get; set; }
    }
}

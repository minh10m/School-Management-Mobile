using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ChangeRoleRequest
    {
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Vai trò không được để trống")]
        public string? Role { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class ChangeRoleRequest
    {
        [RegularExpression(@"^(?!\s*$).+", ErrorMessage = "Role cannot be empty")]
        public string? Role { get; set; }
    }
}

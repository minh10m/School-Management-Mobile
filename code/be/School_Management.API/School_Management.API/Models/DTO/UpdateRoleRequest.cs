using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateRoleRequest
    {
        [MaxLength(100, ErrorMessage = "FullName is too long")]
        [RegularExpression(@"^(?!\s*$)[\p{L}0-9 ]+$", ErrorMessage = "Name cannot contain special characters or be only whitespace")]
        public string? Name { get; set; }
    }
}

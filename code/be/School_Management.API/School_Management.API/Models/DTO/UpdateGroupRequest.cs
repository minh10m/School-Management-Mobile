using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class UpdateGroupRequest
    {
        public string? ConversationName { get; set; }
        public IFormFile? Avatar { get; set; }
    }
}

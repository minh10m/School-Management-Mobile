namespace School_Management.API.Models.DTO
{
    public class UserFilterRequest: BaseRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public string? Role { get; set; }
    }
}

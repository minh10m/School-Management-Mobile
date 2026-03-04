using Microsoft.AspNetCore.Identity;

namespace School_Management.API.Models.Domain
{
    public class AppUser : IdentityUser<Guid>
    {
        public string FullName { get; set; }
        public string Address { get; set; }
        public DateTime Birthday { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }
}

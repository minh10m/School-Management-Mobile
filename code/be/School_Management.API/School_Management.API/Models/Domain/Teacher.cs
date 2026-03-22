namespace School_Management.API.Models.Domain
{
    public class Teacher
    {
        public Guid Id { get; set; }
        
        // FK
        public Guid UserId { get; set; }

        // Navigation property
        public AppUser User { get; set; }
    }
}

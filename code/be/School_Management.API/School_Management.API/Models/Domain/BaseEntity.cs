namespace School_Management.API.Models.Domain
{
    public abstract class BaseEntity : ISoftDelete
    {
        public bool IsDeleted { get; set; } = false;
    }
}

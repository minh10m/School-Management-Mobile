namespace School_Management.API.Models.Domain
{
    public interface ISoftDelete
    {
        public bool IsDeleted { get; set; }
    }
}

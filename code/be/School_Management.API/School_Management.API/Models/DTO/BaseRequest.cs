namespace School_Management.API.Models.DTO
{
    public class BaseRequest
    {
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

    }
}

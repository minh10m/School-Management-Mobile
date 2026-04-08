namespace School_Management.API.Models.DTO
{
    public class BaseRequestSecond
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;

    }

    public class BaseRequest : BaseRequestSecond
    {
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;
    }
}

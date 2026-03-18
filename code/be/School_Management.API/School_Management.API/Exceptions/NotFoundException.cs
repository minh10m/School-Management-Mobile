namespace School_Management.API.Exceptions
{
    public class NotFoundException : AppException
    {
        public NotFoundException(string message = "NotFound")
            : base(message, 404, "NotFound")
        {
            
        }
    }
}

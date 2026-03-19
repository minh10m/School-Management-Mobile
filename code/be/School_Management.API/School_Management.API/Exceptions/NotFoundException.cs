namespace School_Management.API.Exceptions
{
    public class NotFoundException : ApplicationException
    {
        public NotFoundException(string message = "NotFound")
            : base(message, 404, "NotFound")
        {
            
        }
    }
}

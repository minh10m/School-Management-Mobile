namespace School_Management.API.Exceptions
{
    public class ForbiddenException : ApplicationException
    {
        public ForbiddenException(string message = "Forbidden")
            : base(message, 403, "Forbidden")
        {
            
        }
    }
}

namespace School_Management.API.Exceptions
{
    public class UnauthorizedException : ApplicationException
    {
        public UnauthorizedException(string message = "Unauthorized") 
            : base(message, 401, "Unauthorized")
        {
            
        }
    }
}

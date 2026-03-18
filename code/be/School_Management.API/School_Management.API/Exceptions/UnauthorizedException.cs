namespace School_Management.API.Exceptions
{
    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message = "Unauthorized") 
            : base(message, 401, "Unauthorized")
        {
            
        }
    }
}

namespace School_Management.API.Exceptions
{
    public class BadRequestException : AppException
    {
        public BadRequestException(string message = "BadRequest") 
            : base(message, 400, "BadRequest")
        {
    
        }
    }
}

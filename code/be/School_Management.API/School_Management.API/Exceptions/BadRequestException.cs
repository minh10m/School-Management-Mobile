namespace School_Management.API.Exceptions
{
    public class BadRequestException : ApplicationException
    {
        public BadRequestException(string message = "BadRequest") 
            : base(message, 400, "BadRequest")
        {
    
        }
    }
}

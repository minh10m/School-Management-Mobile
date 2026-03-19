namespace School_Management.API.Exceptions
{
    public class ConflictException : ApplicationException
    {
        public ConflictException(string message = "Conflict") 
            : base (message, 409, "Conflict")
        {
            
        }
    }
}

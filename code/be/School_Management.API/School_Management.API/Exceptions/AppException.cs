namespace School_Management.API.Exceptions
{
    public class ApplicationException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public ApplicationException(string message, int statusCode = 500, string errorCode = null) : base(message)
        {
            this.StatusCode = statusCode;
            this.ErrorCode = errorCode;
        }
    }
}

namespace School_Management.API.Exceptions
{
    public class AppException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public AppException(string message, int statusCode = 500, string errorCode = null) : base(message)
        {
            this.StatusCode = statusCode;
            this.ErrorCode = errorCode;
        }
    }
}

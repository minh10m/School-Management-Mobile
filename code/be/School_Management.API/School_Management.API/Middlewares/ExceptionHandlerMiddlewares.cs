using School_Management.API.Exceptions;
using System.Net;

namespace School_Management.API.Middlewares
{
    public class ExceptionHandlerMiddlewares
    {
        private readonly ILogger<ExceptionHandlerMiddlewares> logger;
        private readonly RequestDelegate next;

        public ExceptionHandlerMiddlewares(ILogger<ExceptionHandlerMiddlewares> logger, 
            RequestDelegate next)
        {
            this.logger = logger;
            this.next = next;
        }

        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await next(httpContext);
            }
            catch(Exceptions.ApplicationException ex)
            {
                var errorId = Guid.NewGuid();

                //Log error
                logger.LogError(ex, $"{errorId} : {ex.Message}");

                //Return a custom error respone
                httpContext.Response.StatusCode = ex.StatusCode;
                httpContext.Response.ContentType = "application/json";

                var error = new
                {
                    Id = errorId,
                    Message = ex.Message,
                    ErrorCode = ex.ErrorCode
                };

                await httpContext.Response.WriteAsJsonAsync(error);
            }
            catch (Exception ex)
            {
                var errorId = Guid.NewGuid();

                //Log error
                logger.LogError(ex, $"{errorId} : {ex.Message}");

                //Return a custom error respone
                httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                httpContext.Response.ContentType = "application/json";

                var error = new
                {
                    Id = errorId,
                    Message = ex.Message
                };

                await httpContext.Response.WriteAsJsonAsync(error);

            }
        }

    }
}

using System.Text.Json;

namespace School_Management.API.Middlewares
{
    public class ResponseWrapperMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ResponseWrapperMiddleware> _logger;

        public ResponseWrapperMiddleware(RequestDelegate next, ILogger<ResponseWrapperMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var path = context.Request.Path.Value;
            
            // Skip wrapping for Swagger, Health checks, and SignalR
            if (path != null && (
                path.StartsWith("/swagger") || 
                path.StartsWith("/health") || 
                path.StartsWith("/paymentHub")))
            {
                await _next(context);
                return;
            }

            // Store the original response body stream
            var originalBodyStream = context.Response.Body;

            using var memoryStream = new MemoryStream();
            context.Response.Body = memoryStream;

            try
            {
                await _next(context);
            }
            finally
            {
                // Reset the response body pointer to the start
                memoryStream.Seek(0, SeekOrigin.Begin);
                var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();
                
                var originalStatusCode = context.Response.StatusCode;

                // Create custom status code (e.g., 200 -> 50200, 404 -> 50404)
                var customStatusCode = 50000 + originalStatusCode;

                if (originalStatusCode >= 400)
                {
                    _logger.LogInformation($"Adding custom metric for status code: {customStatusCode}");
                    School_Management.API.AppMetrics.CustomErrors.Add(1, 
                        new KeyValuePair<string, object>("custom_status_code", customStatusCode.ToString()));
                }

                object data = null;
                if (!string.IsNullOrWhiteSpace(responseBody))
                {
                    try
                    {
                        // Try to parse the original response as a JSON object
                        data = JsonSerializer.Deserialize<object>(responseBody);
                    }
                    catch
                    {
                        // If it's not JSON, return as string
                        data = responseBody;
                    }
                }

                var wrapper = new
                {
                    statusCode = customStatusCode,
                    data = data
                };

                // Ensure the HTTP Status Code is always 200 OK at network layer
                context.Response.StatusCode = StatusCodes.Status200OK;
                context.Response.ContentType = "application/json";
                context.Response.Headers.Remove("Content-Length");

                // Re-write the response
                context.Response.Body = originalBodyStream;
                var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                await context.Response.WriteAsJsonAsync(wrapper, jsonOptions);
            }
        }
    }
}

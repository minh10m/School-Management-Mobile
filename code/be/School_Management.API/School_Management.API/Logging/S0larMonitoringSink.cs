using Serilog.Core;
using Serilog.Events;
using System.Text;
using System.Text.Json;

namespace School_Management.API.Logging;

public class S0larMonitoringSink : ILogEventSink, IDisposable
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;

    public S0larMonitoringSink(string apiUrl, string apiKey)
    {
        _apiUrl = apiUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);
    }

    public void Emit(LogEvent logEvent)
    {
        // Chuyển đổi Serilog Level sang mức chuẩn của S0LAR
        string level = logEvent.Level switch
        {
            LogEventLevel.Fatal => "ERROR",
            LogEventLevel.Error => "ERROR",
            LogEventLevel.Warning => "WARN",
            LogEventLevel.Debug => "DEBUG",
            LogEventLevel.Verbose => "DEBUG",
            _ => "INFO"
        };

        var payload = new[]
        {
            new
            {
                level = level,
                message = logEvent.RenderMessage(),
                source = "School_Management.API",
                timestamp = logEvent.Timestamp.UtcDateTime.ToString("o")
            }
        };

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Gửi log dạng Fire-and-forget để không chặn luồng chính của Backend
        _ = _httpClient.PostAsync(_apiUrl, content);
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}

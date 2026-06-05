using System.Diagnostics.Metrics;
using System.Collections.Generic;

namespace School_Management.API
{
    public static class AppMetrics
    {
        public static readonly Meter Meter = new("School_Management.API");
        public static readonly Counter<long> CustomErrors = Meter.CreateCounter<long>(
            "custom_error_count", 
            description: "Counts custom errors");
    }
}

using System.Text.Json.Serialization;

namespace School_Management.API.Models.DTO
{
    public class SepayWebhookRequest
    {
        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;

        [JsonPropertyName("transferAmount")]
        public decimal TransferAmount { get; set; }

        [JsonPropertyName("subAccount")]
        public string SubAccount { get; set; } = string.Empty;

        [JsonPropertyName("transactionDate")]
        public string TransactionDate { get; set; } = string.Empty;

        [JsonPropertyName("id")]
        public long Id { get; set; }
    }
}

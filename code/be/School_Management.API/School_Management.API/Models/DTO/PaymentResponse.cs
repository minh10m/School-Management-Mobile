namespace School_Management.API.Models.DTO
{
    public class PaymentResponse
    {
        public Guid PaymentId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = "6201438366"; 
        public string AccountName { get; set; } = "LE THI HONG ANH";
        public string BankName { get; set; } = "BIDV";
        public string Bin { get; set; } = "970418";
        public string QrCodeUrl { get; set; } = string.Empty;
    }
}

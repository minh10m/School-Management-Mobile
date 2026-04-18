namespace School_Management.API.Models.DTO
{
    public class SepayWebhookRequest
    {
        public string Content { get; set; } = string.Empty;       // Nội dung chuyển khoản
        public decimal TransferAmount { get; set; }              // Số tiền nhận được
        public string ReferenceCode { get; set; } = string.Empty; // Mã tham chiếu (mã giao dịch ngân hàng)
        public DateTime TransferDate { get; set; }
    }
}

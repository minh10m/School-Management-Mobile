using System.Collections.Generic;

namespace School_Management.API.Models.DTO
{
    public class SepayTransactionListResponse
    {
        public int Status { get; set; }
        public List<SepayTransactionItem>? Transactions { get; set; }
    }

    public class SepayTransactionItem
    {
        public long Id { get; set; }
        public string BankBrandName { get; set; } = string.Empty;
        public decimal AmountIn { get; set; }
        public string TransactionContent { get; set; } = string.Empty;
        public string TransactionDate { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
    }
}

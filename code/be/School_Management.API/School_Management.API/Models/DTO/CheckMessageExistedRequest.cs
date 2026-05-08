using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class CheckMessageExistedRequest
    {
        public Guid SenderId { get; set; }
        public Guid ReceiverId { get; set; }
    }
}

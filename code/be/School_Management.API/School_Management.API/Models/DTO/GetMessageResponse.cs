using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class GetMessageResponse
    {
        public PagedResponse<MessageResponse> MessageResponse { get; set; } = null!;
        public List<MemberInfo> MemberInfos { get; set; } = null!;
    }

    public class MessageResponse
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public string SenderName { get; set; } = null!;
        public Guid ConversationId { get; set; }
        public string Content { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class MemberInfo
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = null!;
    }

    public class CreateGroupRequest
    {
        [Required(ErrorMessage = "Tên nhóm là bắt buộc")]
        public string GroupName { get; set; } = null!;
        [Required(ErrorMessage = "Phải có thành viên trong nhóm")]
        [MinLength(2, ErrorMessage = "Nhóm cần ít nhất 2 thành viên ngoài bạn")]
        public List<Guid> MemberIds { get; set; } = new();
    }

    public class AddMembersRequest
    {
        public Guid ConversationId { get; set; }
        [Required(ErrorMessage = "Phải có thành viên trong nhóm")]
        [MinLength(1, ErrorMessage = "Cần ít nhất 1 thành viên mới")]
        public List<Guid> MemberIds { get; set; } = new();
    }
}

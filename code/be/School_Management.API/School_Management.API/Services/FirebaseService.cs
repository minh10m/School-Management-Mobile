using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;

namespace School_Management.API.Services
{
    public class FirebaseService : IFirebaseService
    {
        private readonly FirestoreDb _db;

        public FirebaseService(IConfiguration configuration)
        {
            var projectId = configuration["Firebase:ProjectId"];
            var configJson = configuration["Firebase:Config"];

            var firestoreClient = new FirestoreClientBuilder
            {
                JsonCredentials = configJson
            }.Build();

            _db = FirestoreDb.Create(projectId, firestoreClient);
        }
        public async Task UpdateGroupMembers(Guid conversationId, List<Guid> allMemberIds)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());
            var snapshot = await docRef.GetSnapshotAsync();

            var newMemberStrings = allMemberIds.Select(m => m.ToString()).ToList();

            if (!snapshot.Exists)
            {
                // Không có doc thì tạo mới — trường hợp hiếm gặp
                await docRef.SetAsync(new Dictionary<string, object>
        {
            { "lastMessageAt", Timestamp.GetCurrentTimestamp() },
            { "members", newMemberStrings },
            { "unreadCounts", allMemberIds.ToDictionary(m => m.ToString(), m => (object)0) }
        });
            }
            else
            {
                // Chỉ update members, giữ nguyên unreadCounts và lastMessageAt
                var existingUnreadCounts = snapshot.GetValue<Dictionary<string, object>>("unreadCounts");

                // Thêm unreadCount = 0 cho member mới nếu chưa có
                foreach (var memberId in allMemberIds)
                {
                    var key = memberId.ToString();
                    if (!existingUnreadCounts.ContainsKey(key))
                        existingUnreadCounts[key] = 0;
                }

                await docRef.UpdateAsync(new Dictionary<string, object>
        {
            { "members", newMemberStrings },
            { "unreadCounts", existingUnreadCounts }
        });
            }
        }
        public async Task UpdateConversation(Guid conversationId, Guid senderId, List<Guid> receiverIds)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());
            var snapshot = await docRef.GetSnapshotAsync();

            var allMembers = receiverIds.Select(r => r.ToString())
                                        .Append(senderId.ToString()).ToList();

            if (!snapshot.Exists)
            {
                var unreadCounts = receiverIds.ToDictionary(r => r.ToString(), r => (object)1);
                unreadCounts[senderId.ToString()] = 0;

                await docRef.SetAsync(new Dictionary<string, object>
        {
            { "lastMessageAt", Timestamp.GetCurrentTimestamp() },
            { "members", allMembers },
            { "unreadCounts", unreadCounts }
        });
            }
            else
            {
                var updates = new Dictionary<string, object>
        {
            { "lastMessageAt", Timestamp.GetCurrentTimestamp() }
        };
                foreach (var receiverId in receiverIds)
                    updates[$"unreadCounts.{receiverId}"] = FieldValue.Increment(1);

                await docRef.UpdateAsync(updates);
            }
        }

        public async Task ResetUnreadCount(Guid conversationId, Guid userId)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());
            await docRef.UpdateAsync(new Dictionary<string, object>
    {
        { $"unreadCounts.{userId}", 0 }
    });
        }

        public async Task CreateGroupConversation(Guid conversationId, List<Guid> memberIds)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());

            var unreadCounts = memberIds.ToDictionary(m => m.ToString(), m => (object)0);

            await docRef.SetAsync(new Dictionary<string, object>
    {
        { "lastMessageAt", Timestamp.GetCurrentTimestamp() },
        { "members", memberIds.Select(m => m.ToString()).ToList() },
        { "unreadCounts", unreadCounts }
    });
        }
    }


}

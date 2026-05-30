using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using Google.Cloud.Firestore.V1;
using School_Management.API.Models.Domain;

namespace School_Management.API.Services
{
    public class FirebaseService : IFirebaseService
    {
        private readonly FirestoreDb _db;

        public FirebaseService(IConfiguration configuration)
        {
            try
            {
                var projectId = configuration["Firebase:ProjectId"];
                var configJson = configuration["Firebase:Config"];

                if (string.IsNullOrEmpty(configJson))
                {
                    Console.WriteLine("[FIREBASE ERROR] ConfigJson is null or empty!");
                    return;
                }

                var credential = GoogleCredential.FromJson(configJson);
                var client = new FirestoreClientBuilder
                {
                    Credential = credential
                }.Build();

                _db = FirestoreDb.Create(projectId, client);
                Console.WriteLine("[FIREBASE SUCCESS] FirestoreDb initialized successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[FIREBASE ERROR] Critical initialization failure: {ex.Message}");
            }
        }
        public async Task UpdateGroupMembers(Guid conversationId, List<Guid> allMemberIds)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());
            var snapshot = await docRef.GetSnapshotAsync();
            var newMemberStrings = allMemberIds.Select(m => m.ToString()).ToList();

            if (!snapshot.Exists)
            {
                await docRef.SetAsync(new Dictionary<string, object>
        {
            { "lastMessageAt", Timestamp.GetCurrentTimestamp() },
            { "members", newMemberStrings },
            { "unreadCounts", allMemberIds.ToDictionary(m => m.ToString(), m => (object)0) }
        });
            }
            else
            {
                var existingUnreadCounts = snapshot.GetValue<Dictionary<string, object>>("unreadCounts");

                var newUnreadCounts = allMemberIds.ToDictionary(
                    m => m.ToString(),
                    m => existingUnreadCounts.ContainsKey(m.ToString())
                        ? existingUnreadCounts[m.ToString()]
                        : (object)0
                );

                await docRef.UpdateAsync(new Dictionary<string, object>
        {
            { "members", newMemberStrings },
            { "unreadCounts", newUnreadCounts }
        });
            }
        }
        public async Task UpdateConversation(Guid conversationId, List<Guid> receiverIds, Message message, string senderName)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());
            var snapshot = await docRef.GetSnapshotAsync();

            var allMembers = receiverIds.Select(r => r.ToString())
                                        .Append(message.SenderId.ToString()).ToList();

            if (!snapshot.Exists)
            {
                var unreadCounts = receiverIds.ToDictionary(r => r.ToString(), r => (object)1);
                unreadCounts[message.SenderId.ToString()] = 0;

                await docRef.SetAsync(new Dictionary<string, object>
        {
            { "lastMessageAt", Timestamp.GetCurrentTimestamp() },
            { "members", allMembers },
            { "unreadCounts", unreadCounts },
            { "lastMessage", new Dictionary<string, object>
            {
                { "id", message.Id.ToString()},
                { "senderId", message.SenderId.ToString()},
                { "content", message.Content},
                { "senderName", senderName},
                { "type", message.Type },
                { "conversationId", message.ConversationId.ToString()},
                { "status", message.Status },
                { "createdAt", message.CreatedAt.ToString("o")}
            }

            }
        });
            }
            else
            {
                var updates = new Dictionary<string, object>
        {
            { "lastMessageAt", Timestamp.GetCurrentTimestamp() },
            { "lastMessage", new Dictionary<string, object>
            {
                { "id", message.Id.ToString()},
                { "senderId", message.SenderId.ToString()},
                { "content", message.Content},
                { "senderName", senderName},
                { "type", message.Type },
                { "conversationId", message.ConversationId.ToString()},
                { "status", message.Status },
                { "createdAt", message.CreatedAt.ToString("o")}
            }

            }
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

        public async Task CreateNotification(Guid userId, int unReadQuantity, Notification request)
        {
            var docRef = _db.Collection("notifications").Document(userId.ToString());

            await docRef.SetAsync(new Dictionary<string, object>
    {
        { "lastUpdate", Timestamp.GetCurrentTimestamp() },
        { "unReadCounts", unReadQuantity},
        { "lastNoti", new Dictionary<string, object>
            {
                { "id" , request.Id.ToString() },
                { "title" , request.Title },
                { "type", request.Type},
                { "content", request.Content },
                { "createdAt", request.CreatedAt}
            }
        }
    }, SetOptions.MergeAll);
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

        public async Task ResetUnreadCountNoti(Guid userId)
        {
            var docRef = _db.Collection("notifications").Document(userId.ToString());
            await docRef.SetAsync(new Dictionary<string, object>
            {
                {"unReadCounts" , 0 }
            }, SetOptions.MergeAll);
        }

        public async Task RecallMessage(Guid conversationId, Guid messageId, bool isLastMessage)
        {
            var docRef = _db.Collection("conversations").Document(conversationId.ToString());

            var updates = new Dictionary<string, object>
    {
        { "lastRecalledMessage", new Dictionary<string, object>
            {
                { "messageId", messageId.ToString() },
                { "recalledAt", Timestamp.GetCurrentTimestamp() }
            }
        }
    };

            if (isLastMessage)
            {
                updates["lastMessage.content"] = "Tin nhắn đã được thu hồi";
                updates["lastMessage.isDeleted"] = true;
            }

            await docRef.UpdateAsync(updates);
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using LiFeDenTal.Data;
using LiFeDenTal.Models;

namespace LiFeDenTal.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly LiFeDenTalDbContext _db;
    private static readonly Dictionary<int, string> _connections = new();

    public ChatHub(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _connections[userId] = Context.ConnectionId;
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        _connections.Remove(userId);
        await base.OnDisconnectedAsync(exception);
    }

    public async Task SendMessage(int receiverId, string content)
    {
        var senderId = int.Parse(Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sender = await _db.Users.FindAsync(senderId);
        if (sender is null) return;

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        var payload = new
        {
            message.Id,
            message.SenderId,
            SenderName = $"{sender.FirstName} {sender.LastName}",
            SenderRole = sender.Role.ToString(),
            message.ReceiverId,
            message.Content,
            message.SentAt,
            message.IsRead
        };

        // Skicka till mottagaren om online
        if (_connections.TryGetValue(receiverId, out var receiverConnectionId))
            await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", payload);

        // Skicka tillbaka till avsändaren
        await Clients.Caller.SendAsync("ReceiveMessage", payload);
    }
}
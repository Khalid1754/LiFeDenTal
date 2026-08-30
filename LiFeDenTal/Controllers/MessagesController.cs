using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LiFeDenTal.Data;

namespace LiFeDenTal.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly LiFeDenTalDbContext _db;

    public MessagesController(LiFeDenTalDbContext db)
    {
        _db = db;
    }

    private int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // Hämta alla användare att skicka till
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var currentId = CurrentUserId;
        var users = await _db.Users
            .Where(u => u.Id != currentId && u.IsActive)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                Role = u.Role.ToString()
            })
            .OrderBy(u => u.Role)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return Ok(users);
    }

    // Hämta konversation mellan två användare
    [HttpGet("conversation/{otherUserId}")]
    public async Task<IActionResult> GetConversation(int otherUserId)
    {
        var currentId = CurrentUserId;
        var messages = await _db.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m =>
                (m.SenderId == currentId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == currentId))
            .OrderBy(m => m.SentAt)
            .Select(m => new
            {
                m.Id,
                m.SenderId,
                SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                SenderRole = m.Sender.Role.ToString(),
                m.ReceiverId,
                m.Content,
                m.SentAt,
                m.IsRead
            })
            .ToListAsync();

        // Markera som lästa
        var unread = await _db.Messages
            .Where(m => m.SenderId == otherUserId && m.ReceiverId == currentId && !m.IsRead)
            .ToListAsync();
        unread.ForEach(m => m.IsRead = true);
        await _db.SaveChangesAsync();

        return Ok(messages);
    }

    // Hämta senaste konversationer (inbox)
    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var currentId = CurrentUserId;
        var messages = await _db.Messages
            .Include(m => m.Sender)
            .Include(m => m.Receiver)
            .Where(m => m.SenderId == currentId || m.ReceiverId == currentId)
            .OrderByDescending(m => m.SentAt)
            .ToListAsync();

        var conversations = messages
            .GroupBy(m => m.SenderId == currentId ? m.ReceiverId : m.SenderId)
            .Select(g =>
            {
                var latest = g.First();
                var otherUser = latest.SenderId == currentId ? latest.Receiver : latest.Sender;
                return new
                {
                    UserId = otherUser.Id,
                    UserName = $"{otherUser.FirstName} {otherUser.LastName}",
                    UserRole = otherUser.Role.ToString(),
                    LastMessage = latest.Content,
                    LastMessageAt = latest.SentAt,
                    UnreadCount = g.Count(m => m.ReceiverId == currentId && !m.IsRead)
                };
            })
            .ToList();

        return Ok(conversations);
    }
}
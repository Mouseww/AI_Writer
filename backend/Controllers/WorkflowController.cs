using AIWriter.Data;
using AIWriter.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/novels/{novelId}/workflow")]
    public class WorkflowController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly OrchestratorService _orchestrator;

        public WorkflowController(ApplicationDbContext context, OrchestratorService orchestrator)
        {
            _context = context;
            _orchestrator = orchestrator;
        }

        [HttpPost("status")]
        public async Task<IActionResult> SetStatus(int novelId, [FromBody] StatusUpdateDto statusDto)
        {
            if (!await UserHasAccessToNovel(novelId)) return Forbid();

            var novel = await _context.Novels.FindAsync(novelId);
            if (novel == null) return NotFound();

            novel.Status = statusDto.Status;
            await _context.SaveChangesAsync();

            if (novel.Status == "Writing")
            {
                _orchestrator.StartNovelWriting(novelId);
            }
            else
            {
                _orchestrator.StopNovelWriting(novelId);
            }

            return Ok(new { novel.Status });
        }

        [HttpGet("progress")]
        public async Task<IActionResult> GetProgress(int novelId)
        {
            if (!await UserHasAccessToNovel(novelId)) return Forbid();

            var novel = await _context.Novels.FindAsync(novelId);
            if (novel == null) return NotFound();

            var history = await _context.ConversationHistories
                .Where(h => h.NovelId == novelId)
                .OrderByDescending(h => h.Timestamp)
                .Take(20)
                .Select(h => new { h.Id, AgentName = h.Agent.Name, h.Content, h.Timestamp ,h.Abstract })
                .ToListAsync();

            return Ok(new { novel.Status, History = history });
        }
        
        [HttpPut("history/{historyId}")]
        public async Task<IActionResult> UpdateHistory(int novelId, int historyId, [FromBody] HistoryUpdateDto updateDto)
        {
            if (!await UserHasAccessToNovel(novelId)) return Forbid();

            var historyItem = await _context.ConversationHistories.FindAsync(historyId);
            if (historyItem == null || historyItem.NovelId != novelId) return NotFound();

            historyItem.Content = updateDto.Content;
            if(historyItem.Content.Length < 2000)
            {
                historyItem.Abstract = historyItem.Content;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("history/{historyId}")]
        public async Task<IActionResult> DeleteHistory(int novelId, int historyId)
        {
            if (!await UserHasAccessToNovel(novelId)) return Forbid();

            var historyItem = await _context.ConversationHistories.FindAsync(historyId);
            if (historyItem == null || historyItem.NovelId != novelId) return NotFound();

            _context.ConversationHistories.Remove(historyItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> UserHasAccessToNovel(int novelId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            return await _context.Novels.AnyAsync(n => n.Id == novelId && n.UserId == userId);
        }
    }

    public class StatusUpdateDto
    {
        public string Status { get; set; }
    }
    
    public class HistoryUpdateDto
    {
        public string Content { get; set; }
    }
}

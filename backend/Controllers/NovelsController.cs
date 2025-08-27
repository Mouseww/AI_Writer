using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AIWriter.Services;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NovelsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AIClientService _aiClientService;

        public NovelsController(ApplicationDbContext context, AIClientService aiClientService)
        {
            _context = context;
            _aiClientService = aiClientService;
        }

        // GET: api/novels
        [HttpGet]
        public async Task<IActionResult> GetNovels()
        {
            var userId = GetUserId();
            var novels = await _context.Novels
                .Where(n => n.UserId == userId)
                .ToListAsync();

            // Calculate word count and get latest chapter title for each novel
            foreach (var novel in novels)
            {
                novel.TotalWordCount = _context.Chapters.Where(x => x.NovelId == novel.Id).Sum(c => c.WordCount);
                novel.LatestChapterTitle = _context.Chapters.Where(c => c.NovelId == novel.Id)
                                                .OrderByDescending(c => c.Order)
                                                .Select(c => c.Title)
                                                .FirstOrDefault();
            }

            return Ok(novels);
        }

        // GET: api/novels/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetNovel(int id)
        {
            var userId = GetUserId();
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            novel.Chapters = await _context.Chapters.Where(c => c.NovelId == novel.Id).ToListAsync();
            novel.ConversationHistories = await _context.ConversationHistories.Where(c => c.NovelId == novel.Id).ToListAsync();


            if (novel == null)
            {
                return NotFound();
            }

            novel.TotalWordCount = novel.Chapters.Sum(c => c.WordCount);

            return Ok(novel);
        }

        // POST: api/novels
        [HttpPost]
        public async Task<IActionResult> CreateNovel([FromBody] NovelCreateDto novelDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var novel = new Novel
            {
                Title = novelDto.Title,
                Description = novelDto.Description,
                UserId = GetUserId(),
                Status = "Paused", // Default status
                CreatedAt = DateTime.UtcNow
            };

            _context.Novels.Add(novel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNovel), new { id = novel.Id }, novel);
        }

        // PUT: api/novels/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNovel(int id, [FromBody] NovelUpdateDto novelDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (novel == null)
            {
                return NotFound();
            }

            novel.Title = novelDto.Title;
            novel.Description = novelDto.Description;
            novel.Status = novelDto.Status;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/novels/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNovel(int id)
        {
            var userId = GetUserId();
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (novel == null)
            {
                return NotFound();
            }

            var chapters = await _context.Chapters.Where(c => c.NovelId == id).ToListAsync();
            if (chapters.Any())
            {
                _context.Chapters.RemoveRange(chapters);
            }

            var histories = await _context.ConversationHistories.Where(h => h.NovelId == id).ToListAsync();
            if (histories.Any())
            {
                _context.ConversationHistories.RemoveRange(histories);
            }

            _context.Novels.Remove(novel);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                // This should not happen in an authorized controller, but as a safeguard:
                throw new InvalidOperationException("User ID not found in token.");
            }
            return int.Parse(userIdClaim.Value);
        }



        // POST: api/novels/5/chapters
        [HttpPost("{id}/chapters")]
        public async Task<IActionResult> CreateChapter(int id, [FromBody] ChapterCreateDto chapterDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (novel == null)
            {
                return NotFound("Novel not found.");
            }

            var lastChapter = await _context.Chapters
                .Where(c => c.NovelId == id)
                .OrderByDescending(c => c.Order)
                .FirstOrDefaultAsync();

            var newOrder = (lastChapter?.Order ?? 0) + 1;

            var chapter = new Chapter
            {
                NovelId = id,
                Title = chapterDto.Title,
                Content = chapterDto.Content,
                Order = newOrder,
                WordCount = GetWordCount(chapterDto.Content),
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };

            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChapter), new { id = novel.Id, chapterId = chapter.Id }, chapter);
        }

        // GET: api/novels/5/chapters/1
        [HttpGet("{id}/chapters/{chapterId}")]
        public async Task<IActionResult> GetChapter(int id, int chapterId)
        {
            var userId = GetUserId();
            var chapter = await _context.Chapters
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.Novel.UserId == userId && c.NovelId == id);

            if (chapter == null)
            {
                return NotFound();
            }

            return Ok(chapter);
        }

        // GET: api/novels/5/chapters
        [HttpGet("{id}/chapters")]
        public async Task<IActionResult> GetChapters(int id)
        {
            var userId = GetUserId();
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);

            if (novel == null)
            {
                return NotFound("Novel not found.");
            }

            var chapters = await _context.Chapters
                .Where(c => c.NovelId == id)
                .Select(x => new ChapterModel { Id = x.Id, NovelId = x.NovelId, Title = x.Title, Order = x.Order, WordCount = x.WordCount, CreatedAt = x.CreatedAt, LastUpdatedAt = x.LastUpdatedAt })
                .OrderBy(c => c.Order)
            .ToListAsync();

            return Ok(chapters);
        }

        // PUT: api/novels/5/chapters/1
        [HttpPut("{id}/chapters/{chapterId}")]
        public async Task<IActionResult> UpdateChapter(int id, int chapterId, [FromBody] ChapterUpdateDto chapterDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var chapter = await _context.Chapters
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.Novel.UserId == userId && c.NovelId == id);

            if (chapter == null)
            {
                return NotFound();
            }

            chapter.Title = chapterDto.Title;
            chapter.Content = chapterDto.Content;
            chapter.WordCount = GetWordCount(chapterDto.Content);
            chapter.LastUpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/novels/5/chapters/1
        [HttpDelete("{id}/chapters/{chapterId}")]
        public async Task<IActionResult> DeleteChapter(int id, int chapterId)
        {
            var userId = GetUserId();
            var chapter = await _context.Chapters
                .FirstOrDefaultAsync(c => c.Id == chapterId && c.Novel.UserId == userId && c.NovelId == id);

            if (chapter == null)
            {
                return NotFound();
            }

            _context.Chapters.Remove(chapter);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private int GetWordCount(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            // Count Chinese characters
            int chineseCount = Regex.Matches(text, @"[\u4e00-\u9fa5]").Count;

            // Count English words and numbers
            int otherCount = Regex.Matches(text, @"[a-zA-Z0-9]+").Count;

            return chineseCount + otherCount;
        }

        [HttpPost("{id}/workflow/history/{historyId}/regenerate-abstract")]
        public async Task<IActionResult> RegenerateAbstract(int id, int historyId)
        {
            var userId = GetUserId();

            var novelId = (await _context.Novels
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId))?.Id;
            var historyItem = await _context.ConversationHistories
                .FirstOrDefaultAsync(h => h.Id == historyId && h.NovelId == novelId);

            if (historyItem == null)
            {
                return NotFound();
            }

            var novel = await _context.Novels.FindAsync(id);
            var abstracter = await _context.Agents.FirstOrDefaultAsync(a => a.UserId == userId && a.Order == 2);

            if (abstracter == null)
            {
                return BadRequest("Abstracter agent not found.");
            }

            var messages = new List<Message>
            {
                new Message { Role = "system", Content = abstracter.Prompt },
                new Message { Role = "user", Content = $"标题：\r\n{novel.Title}\r\n\r\n正文：\r\n{historyItem.Content}" }
            };

            var newAbstract = await _aiClientService.GenerateText(abstracter.Model, messages);

            historyItem.Abstract = newAbstract;
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}

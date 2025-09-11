using AIWriter.Dtos;
using AIWriter.Models;
using AIWriter.Services.Interfaces;
using AIWriter.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using AIWriter.Vos;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/novels/{novelId}/chapters")]
    public class ChaptersController : ControllerBase
    {
        private readonly IChapterService _chapterService;

        public ChaptersController(IChapterService chapterService)
        {
            _chapterService = chapterService;
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChapterVo>>> GetNovelChapters(int novelId)
        {
            var userId = GetUserId();
            var chapters = await _chapterService.GetChaptersAsync(novelId, userId);
            return Ok(chapters);
        }

        [HttpGet("{chapterId}")]
        public async Task<ActionResult<ChapterVo>> GetChapterDetail(int novelId, int chapterId)
        {
            var userId = GetUserId();
            var chapter = await _chapterService.GetChapterAsync(novelId, chapterId, userId);

            if (chapter == null)
            {
                return NotFound();
            }

            return Ok(chapter);
        }

        [HttpPost]
        public async Task<ActionResult<ChapterVo>> CreateChapter(int novelId, ChapterCreateDto chapterCreateDto)
        {
            var userId = GetUserId();
            var createdChapter = await _chapterService.CreateChapterAsync(novelId, chapterCreateDto, userId);

            if (createdChapter == null)
            {
                return BadRequest("Could not create chapter. Novel not found or unauthorized.");
            }

            return CreatedAtAction(nameof(GetChapterDetail), new { novelId = novelId, chapterId = createdChapter.Id }, createdChapter);
        }

        [HttpPut("{chapterId}")]
        public async Task<ActionResult<ChapterVo>> UpdateChapter(int novelId, int chapterId, ChapterUpdateDto chapterUpdateDto)
        {
            var userId = GetUserId();
            var updatedChapter = await _chapterService.UpdateChapterAsync(novelId, chapterId, chapterUpdateDto, userId);

            if (updatedChapter == null)
            {
                return NotFound();
            }

            return Ok(updatedChapter);
        }

        [HttpDelete("{chapterId}")]
        public async Task<IActionResult> DeleteChapter(int novelId, int chapterId)
        {
            var userId = GetUserId();
            await _chapterService.DeleteChapterAsync(novelId, chapterId, userId);
            return NoContent();
        }

        [HttpPost("{chapterId}/rewrite")]
        public async Task<IActionResult> RewriteChapter(int novelId, int chapterId)
        {
            var userId = GetUserId();
            await _chapterService.RewriteChapterAsync(novelId, chapterId, userId);
            return Ok();
        }
    }
}

using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AIWriter.Services.Implementations;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Http.HttpResults;
using static System.Net.Mime.MediaTypeNames;
using AIWriter.Services.Interfaces;
using AIWriter.Vos;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NovelsController : ControllerBase
    {
        private readonly INovelService _novelService;

        public NovelsController(INovelService novelService)
        {
            _novelService = novelService;
        }

        // GET: api/novels
        [HttpGet]
        public async Task<ActionResult<IEnumerable<NovelVo>>> GetNovels()
        {
            var userId = GetUserId();
            var novels = await _novelService.GetNovelsAsync(userId);
            return Ok(novels);
        }

        // GET: api/novels/5
        [HttpGet("{id}")]
        public async Task<ActionResult<NovelVo>> GetNovel(int id)
        {
            var userId = GetUserId();
            var novel = await _novelService.GetNovelByIdAsync(id, userId);

            if (novel == null)
            {
                return NotFound();
            }

            return Ok(novel);
        }

        // POST: api/novels
        public async Task<ActionResult<NovelVo>> CreateNovel([FromBody] NovelCreateDto novelDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var novel = await _novelService.CreateNovelAsync(novelDto, userId);

            return CreatedAtAction(nameof(GetNovel), new { id = novel.Id }, novel);
        }

        // PUT: api/novels/5
        public async Task<ActionResult<NovelVo>> UpdateNovel(int id, [FromBody] NovelUpdateDto novelDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetUserId();
            var updatedNovel = await _novelService.UpdateNovelAsync(id, novelDto, userId);

            if (updatedNovel == null)
            {
                return NotFound();
            }

            return Ok(updatedNovel);
        }

        // DELETE: api/novels/5
        public async Task<IActionResult> DeleteNovel(int id)
        {
            var userId = GetUserId();
            await _novelService.DeleteNovelAsync(id, userId);
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
        

        // GET: api/novels/5/chapters/1
        

        // GET: api/novels/5/chapters
        

        // PUT: api/novels/5/chapters/1
        

        // DELETE: api/novels/5/chapters/1
        

        

        [HttpPost("{id}/workflow/history/{historyId}/regenerate-abstract")]
        public async Task<IActionResult> RegenerateAbstract(int id, int historyId)
        {
            var userId = GetUserId();
            var result = await _novelService.RegenerateAbstractAsync(id, historyId, userId);

            if (!result)
            {
                return NotFound();
            }

            return Ok();
        }

    }
}

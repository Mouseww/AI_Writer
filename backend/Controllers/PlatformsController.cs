using AIWriter.Dtos;
using AIWriter.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PlatformsController : ControllerBase
    {
        private readonly IPlatformService _platformService;

        public PlatformsController(IPlatformService platformService)
        {
            _platformService = platformService;
        }

        [HttpGet("novel-platforms")]
        public async Task<IActionResult> GetAllNovelPlatforms()
        {
            var platforms = await _platformService.GetAllNovelPlatformsAsync();
            return Ok(platforms);
        }

        [HttpGet("user-novel-platforms")]
        public async Task<IActionResult> GetUserNovelPlatforms()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var platforms = await _platformService.GetUserNovelPlatformsAsync(userId);
            return Ok(platforms);
        }

        [HttpPost("user-novel-platforms")]
        public async Task<IActionResult> CreateUserNovelPlatform([FromBody] UserNovelPlatformCreateDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var createdPlatform = await _platformService.CreateUserNovelPlatformAsync(userId, dto);
            return Ok(createdPlatform);
        }

        [HttpDelete("user-novel-platforms/{id}")]
        public async Task<IActionResult> DeleteUserNovelPlatform(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            await _platformService.DeleteUserNovelPlatformAsync(userId, id);
            return NoContent();
        }

        [HttpPost("publish-chapter")]
        public async Task<IActionResult> PublishChapter([FromBody] PublishChapterDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            await _platformService.PublishChapterAsync(userId, dto.NovelId, dto.ChapterId);
            return Ok();
        }
    }
}

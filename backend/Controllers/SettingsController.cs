using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/settings
        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var userId = GetUserId();
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                // If no settings exist, create a default one
                settings = new UserSetting { UserId = userId };
                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        // POST: api/settings
        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] SettingsUpdateDto settingsDto)
        {
            var userId = GetUserId();
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                // Create new settings if they don't exist
                settings = new UserSetting { UserId = userId };
                _context.UserSettings.Add(settings);
            }

            settings.AiProxyUrl = settingsDto.AiProxyUrl;
            // In a real app, you MUST encrypt the API key before saving.
            settings.EncryptedApiKey = settingsDto.EncryptedApiKey; 

            await _context.SaveChangesAsync();

            return Ok(settings);
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }
    }
}

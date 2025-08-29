
using AIWriter.Dtos;
using AIWriter.Services.Interfaces;
using AIWriter.Services.Implementations;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using AIWriter.Vos;

namespace AIWriter.Controllers
{
    /// <summary>
    /// API controller for managing user settings.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SettingsController"/> class.
        /// </summary>
        /// <param name="settingsService">The settings service.</param>
        /// <param name="mapper">The AutoMapper instance.</param>
        public SettingsController(ISettingsService settingsService, IMapper mapper)
        {
            _settingsService = settingsService;
            _mapper = mapper;
        }

        /// <summary>
        /// Gets the user settings.
        /// </summary>
        /// <returns>The user settings.</returns>
        [HttpGet]
        public async Task<ActionResult<UserSettingVo>> GetSettings()
        {
            var userId = GetUserId();
            var settings = await _settingsService.GetSettingsAsync(userId);
            return Ok(settings);
        }

        /// <summary>
        /// Updates the user settings.
        /// </summary>
        /// <param name="settingsDto">The settings to update.</param>
        /// <returns>The updated user settings.</returns>
        [HttpPost]
        public async Task<ActionResult<UserSettingVo>> UpdateSettings([FromBody] SettingsUpdateDto settingsDto)
        {
            var userId = GetUserId();
            var settings = await _settingsService.UpdateSettingsAsync(userId, settingsDto);
            return Ok(settings);
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }
    }
}


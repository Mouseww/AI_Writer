
using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using AIWriter.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using AutoMapper;
using AIWriter.Vos;

namespace AIWriter.Services.Implementations
{
    /// <summary>
    /// Service for managing user settings.
    /// </summary>
    public class SettingsService : ISettingsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        /// <summary>
        /// Initializes a new instance of the <see cref="SettingsService"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="mapper">The AutoMapper instance.</param>
        public SettingsService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Gets the user settings for the specified user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <returns>The user settings.</returns>
        public async Task<UserSettingVo> GetSettingsAsync(int userId)
        {
            var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);

            if (settings == null)
            {
                // If no settings exist, create a default one
                settings = new UserSetting { UserId = userId };
                _context.UserSettings.Add(settings);
                await _context.SaveChangesAsync();
            }

            return _mapper.Map<UserSettingVo>(settings);
        }

        /// <summary>
        /// Updates the user settings for the specified user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="settingsDto">The settings to update.</param>
        /// <returns>The updated user settings.</returns>
        public async Task<UserSettingVo> UpdateSettingsAsync(int userId, SettingsUpdateDto settingsDto)
        {
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

            return _mapper.Map<UserSettingVo>(settings);
        }
    }
}

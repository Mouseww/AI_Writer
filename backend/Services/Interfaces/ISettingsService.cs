using AIWriter.Dtos;
using AIWriter.Models;
using System.Threading.Tasks;
using AIWriter.Vos;

namespace AIWriter.Services.Interfaces
{
    /// <summary>
    /// Service for managing user settings.
    /// </summary>
    public interface ISettingsService
    {
        /// <summary>
        /// Gets the user settings for the specified user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <returns>The user settings.</returns>
        Task<UserSettingVo> GetSettingsAsync(int userId);

        /// <summary>
        /// Updates the user settings for the specified user.
        /// </summary>
        /// <param name="userId">The user ID.</param>
        /// <param name="settingsDto">The settings to update.</param>
        /// <returns>The updated user settings.</returns>
        Task<UserSettingVo> UpdateSettingsAsync(int userId, SettingsUpdateDto settingsDto);
    }
}

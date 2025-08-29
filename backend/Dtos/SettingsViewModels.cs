
namespace AIWriter.Dtos
{
    /// <summary>
    /// View model for user settings.
    /// </summary>
    public class SettingsViewModel
    {
        /// <summary>
        /// Gets or sets the AI proxy URL.
        /// </summary>
        public string? AiProxyUrl { get; set; }

        /// <summary>
        /// Gets or sets the encrypted API key.
        /// </summary>
        public string? EncryptedApiKey { get; set; }
    }
}

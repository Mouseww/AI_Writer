using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIWriter.Models
{
    public class UserModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Username { get; set; }
        [Required]
        public string PasswordHash { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class UserSettingModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        public string? AiProxyUrl { get; set; }
        public string? EncryptedApiKey { get; set; } // Should be encrypted
    }

    public class NovelModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        public string? Description { get; set; }
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Paused"; // e.g., "Writing", "Paused", "Completed"
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [NotMapped] // This property will not be stored in the database
        public int TotalWordCount { get; set; }
    }

    public class ChapterModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int NovelId { get; set; }
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        [Required]
        public int Order { get; set; }
        public int WordCount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class AgentModel
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int UserId { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        public string Prompt { get; set; }
        [Required]
        [MaxLength(100)]
        public string Model { get; set; }
        public int Order { get; set; }
    }

    public class ConversationHistoryModel
    {
        public int Id { get; set; }
        [Required]
        public int NovelId { get; set; }

        public int? AgentId { get; set; }
        [Required]
        public string Content { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsUserMessage { get; set; } = false;
    }
}

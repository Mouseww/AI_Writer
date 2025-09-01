using System.ComponentModel.DataAnnotations;

namespace AIWriter.Dtos
{
    public class NovelCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string? Description { get; set; }
    }

    public class NovelUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public string? Description { get; set; }
        public int? UserNovelPlatformId { get; set; }
    }

    public class NovelPlatformDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PublishUrl { get; set; }
    }

    public class UserNovelPlatformDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int NovelPlatformId { get; set; }
        public string PlatformUserName { get; set; }
        public string NovelPlatformName { get; set; }
    }

    public class UserNovelPlatformCreateDto
    {
        [Required]
        public int NovelPlatformId { get; set; }
        [Required]
        public string PlatformUserName { get; set; }
        [Required]
        public string PlatformPassword { get; set; }
    }

    public class WriteRequestDto
    {
        [Required]
        public string Prompt { get; set; }
    }

    public class ChapterCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
        public int Order { get; set; }
        public int WordCount { get; set; }
    }

    public class ChapterUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
        public int Order { get; set; }
        public int WordCount { get; set; }
    }

    public class ChapterDto
    {
        public int Id { get; set; }
        public int NovelId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int Order { get; set; }
        public int WordCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}

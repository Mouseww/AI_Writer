using System.ComponentModel.DataAnnotations;

namespace AIWriter.Dtos
{
    public class NovelCreateDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        public bool AutoPublish { get; set; } = false;
    }

    public class NovelUpdateDto
    {
        [Required]
        public string Title { get; set; }
        public string? Description { get; set; }
        public int? UserNovelPlatformId { get; set; }
        public string? PlatformNumber { get; set; }
        public bool AutoPublish { get; set; }
    }

    public class ChapterCreateDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        public int Order { get; set; }
    }

    public class ChapterUpdateDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }
        public int Order { get; set; }
    }

    public class UserMessageDto
    {
        public string Message { get; set; }
    }
}

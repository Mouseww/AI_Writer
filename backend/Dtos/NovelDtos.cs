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
    }

    public class ChapterUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
        public int Order { get; set; }
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
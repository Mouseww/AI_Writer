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
    }

    public class ChapterUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }
    }
}

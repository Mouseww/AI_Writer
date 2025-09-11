using System.ComponentModel.DataAnnotations;

namespace AIWriter.Dtos
{

    public class PublishChapterDto
    {
        [Required]
        public int NovelId { get; set; }
        [Required]
        public int ChapterId { get; set; }
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
}

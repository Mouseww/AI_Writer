using System;
using System.Collections.Generic;

namespace AIWriter.Vos
{
    public class NovelVo
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int TotalWordCount { get; set; }
        public string? LatestChapterTitle { get; set; }
        public ICollection<ChapterVo> Chapters { get; set; } // Nested VO
    }

    public class ChapterVo
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
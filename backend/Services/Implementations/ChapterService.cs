using AIWriter.Dtos;
using AIWriter.Models;
using AIWriter.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AIWriter.Services.Interfaces;
using AutoMapper;
using AIWriter.Vos;
using AIWriter.Extensions;

namespace AIWriter.Services.Implementations
{
    public class ChapterService : IChapterService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ChapterService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ChapterVo>> GetChaptersAsync(int novelId, int userId)
        {
            var chapters = await _context.Chapters
                                 .Where(c => c.NovelId == novelId && c.Novel.UserId == userId)
                                 .ToListAsync();
            return _mapper.Map<IEnumerable<ChapterVo>>(chapters);
        }

        public async Task<ChapterVo> GetChapterAsync(int novelId, int chapterId, int userId)
        {
            var chapter = await _context.Chapters
                                 .Include(c => c.Novel)
                                 .FirstOrDefaultAsync(c => c.Id == chapterId && c.NovelId == novelId && c.Novel.UserId == userId);
            return _mapper.Map<ChapterVo>(chapter);
        }

        public async Task<ChapterVo> CreateChapterAsync(int novelId, ChapterCreateDto chapterDto, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);
            if (novel == null)
            {
                return null; // Or throw an exception
            }

            var chapter = new Chapter
            {
                NovelId = novelId,
                Title = chapterDto.Title,
                Content = chapterDto.Content,
                Order = chapterDto.Order,
                WordCount = chapterDto.Content.GetChineseCharCount()
            };

            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();
            return _mapper.Map<ChapterVo>(chapter);
        }

        public async Task<ChapterVo> UpdateChapterAsync(int novelId, int chapterId, ChapterUpdateDto chapterDto, int userId)
        {
            var chapter = await _context.Chapters
                                        .Include(c => c.Novel)
                                        .FirstOrDefaultAsync(c => c.Id == chapterId && c.NovelId == novelId && c.Novel.UserId == userId);

            if (chapter == null)
            {
                return null; // Or throw an exception
            }

            chapter.Title = chapterDto.Title;
            chapter.Content = chapterDto.Content;
            chapter.Order = chapterDto.Order;
            chapter.WordCount = chapterDto.Content.GetChineseCharCount();

            _context.Chapters.Update(chapter);
            await _context.SaveChangesAsync();
            return _mapper.Map<ChapterVo>(chapter);
        }

        public async Task DeleteChapterAsync(int novelId, int chapterId, int userId)
        {
            var chapter = await _context.Chapters
                                        .Include(c => c.Novel)
                                        .FirstOrDefaultAsync(c => c.Id == chapterId && c.NovelId == novelId && c.Novel.UserId == userId);

            if (chapter != null)
            {
                _context.Chapters.Remove(chapter);
                await _context.SaveChangesAsync();
            }
        }

        public async Task RewriteChapterAsync(int novelId, int chapterId, int userId)
        {
            var chapter = await _context.Chapters
                                        .Include(c => c.Novel)
                                        .FirstOrDefaultAsync(c => c.Id == chapterId && c.NovelId == novelId && c.Novel.UserId == userId);

            if (chapter != null)
            {
                var novel = chapter.Novel;
                var lastTwoChapters = await _context.Chapters
                                                    .Where(c => c.NovelId == novelId && c.Order < chapter.Order)
                                                    .OrderByDescending(c => c.Order)
                                                    .Take(2)
                                                    .ToListAsync();

                var prompt = $"请根据以下信息，重写章节内容：\n\n" +
                             $"小说标题：{novel.Title}\n" +
                             $"小说描述：{novel.Description}\n\n";

                if (lastTwoChapters.Any())
                {
                    prompt += "前两章内容：\n";
                    foreach (var prevChapter in lastTwoChapters)
                    {
                        prompt += $"标题：{prevChapter.Title}\n内容：{prevChapter.Content}\n\n";
                    }
                }

                prompt += $"当前章节标题：{chapter.Title}\n" +
                          $"请重写这一章的内容。";

                var historyItem = new ConversationHistory
                {
                    NovelId = novelId,
                    Content = prompt,
                    Timestamp = DateTime.UtcNow,
                    IsUserMessage = true
                };

                _context.ConversationHistories.Add(historyItem);
                await _context.SaveChangesAsync();
            }
        }
    }
}

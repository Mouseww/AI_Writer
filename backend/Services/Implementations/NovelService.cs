using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using AIWriter.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AIWriter.Vos;
using System.Text.RegularExpressions;

namespace AIWriter.Services.Implementations
{
    public class NovelService : INovelService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAIClientService _aiClientService;
        private readonly IMapper _mapper;

        public NovelService(ApplicationDbContext context, IAIClientService aiClientService, IMapper mapper)
        {
            _context = context;
            _aiClientService = aiClientService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<NovelVo>> GetNovelsAsync(int userId)
        {
            var novels = await _context.Novels
                .Where(n => n.UserId == userId)
                .ToListAsync();

            foreach (var novel in novels)
            {
                novel.TotalWordCount = await _context.Chapters.Where(x => x.NovelId == novel.Id).SumAsync(c => c.WordCount);
                novel.LatestChapterTitle = await _context.Chapters.Where(c => c.NovelId == novel.Id)
                                                .OrderByDescending(c => c.Order)
                                                .Select(c => c.Title)
                                                .FirstOrDefaultAsync();
            }

            return _mapper.Map<IEnumerable<NovelVo>>(novels);
        }

        public async Task<NovelVo> GetNovelByIdAsync(int novelId, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);

            if (novel == null)
            {
                return null;
            }

            novel.Chapters = await _context.Chapters.Where(c => c.NovelId == novel.Id).ToListAsync();
            novel.ConversationHistories = await _context.ConversationHistories.Include(x => x.Agent).Where(c => c.NovelId == novel.Id).ToListAsync();
            novel.TotalWordCount = novel.Chapters.Sum(c => c.WordCount);

            return _mapper.Map<NovelVo>(novel);
        }

        public async Task<NovelVo> CreateNovelAsync(NovelCreateDto novelDto, int userId)
        {
            var novel = new Novel
            {
                Title = novelDto.Title,
                Description = novelDto.Description,
                UserId = userId,
                Status = "Paused",
                CreatedAt = DateTime.UtcNow,
                AutoPublish = novelDto.AutoPublish
            };

            _context.Novels.Add(novel);
            await _context.SaveChangesAsync();
            return _mapper.Map<NovelVo>(novel);
        }

        public async Task<NovelVo> UpdateNovelAsync(int novelId, NovelUpdateDto novelDto, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);

            if (novel == null)
            {
                return null;
            }

            novel.Title = novelDto.Title;
            novel.Description = novelDto.Description;
            novel.UserNovelPlatformId = novelDto.UserNovelPlatformId;
            novel.PlatformNumber = novelDto.PlatformNumber;
            novel.AutoPublish = novelDto.AutoPublish;
            await _context.SaveChangesAsync();
            return _mapper.Map<NovelVo>(novel);
        }

        public async Task DeleteNovelAsync(int novelId, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);

            if (novel == null)
            {
                return;
            }

            var chapters = await _context.Chapters.Where(c => c.NovelId == novelId).ToListAsync();
            if (chapters.Any())
            {
                _context.Chapters.RemoveRange(chapters);
            }

            var histories = await _context.ConversationHistories.Where(h => h.NovelId == novelId).ToListAsync();
            if (histories.Any())
            {
                _context.ConversationHistories.RemoveRange(histories);
            }

            _context.Novels.Remove(novel);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> RegenerateAbstractAsync(int novelId, int historyId, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);
            if (novel == null)
            {
                return false;
            }

            var historyItem = await _context.ConversationHistories
                .FirstOrDefaultAsync(h => h.Id == historyId && h.NovelId == novelId);

            if (historyItem == null)
            {
                return false;
            }

            var abstracter = await _context.Agents.Where(a => a.UserId == userId).OrderBy(x => x.Order).LastOrDefaultAsync();

            if (abstracter == null)
            {
                return false;
            }

            // Extract title and content from writerOutput
            var titleRegex = new Regex(@"(?:\*\*)?\s*(第[一二三四五六七八九十百千万〇零\d]+章\s+[^\r\n]+)", RegexOptions.Multiline);
            var match = titleRegex.Match(historyItem.Content);

            string title = "";
            string content = "";

            if (match.Success && match.Groups.Count > 1)
            {
                title = match.Groups[1].Value.Split('(')[0].Replace("*", "");
                content = historyItem.Content.Split(new[] { match.Value }, StringSplitOptions.None)[1].Trim();
                var contentArray = content.Split("---");
                content = contentArray[contentArray.Length - 1];
            }
            var messages = new List<Message>
            {
                new Message { Role = "system", Content = abstracter.Prompt },
                new Message { Role = "user", Content = $"标题：\r\n{title}\r\n\r\n正文：\r\n{content}" }
            };

            var newAbstract = await _aiClientService.GenerateText(abstracter.Model, messages);

            historyItem.Abstract = newAbstract;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task ClearChaptersAsync(int novelId, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);
            if (novel == null) return;

            var chapters = await _context.Chapters.Where(c => c.NovelId == novelId).ToListAsync();
            _context.Chapters.RemoveRange(chapters);
            await _context.SaveChangesAsync();
        }

        public async Task ClearHistoryAsync(int novelId, int userId)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);
            if (novel == null) return;

            var histories = await _context.ConversationHistories.Where(h => h.NovelId == novelId).ToListAsync();
            _context.ConversationHistories.RemoveRange(histories);
            await _context.SaveChangesAsync();
        }

        public async Task AddUserMessageAsync(int novelId, int userId, string message)
        {
            var novel = await _context.Novels.FirstOrDefaultAsync(n => n.Id == novelId && n.UserId == userId);
            if (novel == null) return;

            var historyItem = new ConversationHistory
            {
                NovelId = novelId,
                Content = message,
                Timestamp = DateTime.UtcNow,
                Abstract= message,
                IsUserMessage = true,
                ShowInHistory=true
            };

            _context.ConversationHistories.Add(historyItem);
            await _context.SaveChangesAsync();
        }
    }
}

using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using AIWriter.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AIWriter.Services.Implementations
{
    public class PlatformService : IPlatformService
    {
        private readonly ApplicationDbContext _context;

        PublishingService _publishingService;

        public PlatformService(ApplicationDbContext context,PublishingService publishingService)
        {
            _context = context;
            _publishingService=publishingService;
        }

        public async Task<IEnumerable<NovelPlatformDto>> GetAllNovelPlatformsAsync()
        {
            return await _context.NovelPlatforms
                .Select(p => new NovelPlatformDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    PublishUrl = p.PublishUrl
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<UserNovelPlatformDto>> GetUserNovelPlatformsAsync(int userId)
        {
            return await _context.UserNovelPlatforms
                .Where(up => up.UserId == userId)
                .Include(up => up.NovelPlatform)
                .Select(up => new UserNovelPlatformDto
                {
                    Id = up.Id,
                    NovelPlatformId = up.NovelPlatformId,
                    PlatformUserName = up.PlatformUserName,
                    NovelPlatformName=up.NovelPlatform.Name
                })
                .ToListAsync();
        }

        public async Task<UserNovelPlatformDto> CreateUserNovelPlatformAsync(int userId, UserNovelPlatformCreateDto dto)
        {
            var userNovelPlatform = new UserNovelPlatform
            {
                UserId = userId,
                NovelPlatformId = dto.NovelPlatformId,
                PlatformUserName = dto.PlatformUserName,
                PlatformPassword = dto.PlatformPassword // Remember to encrypt this in a real application
            };

            _context.UserNovelPlatforms.Add(userNovelPlatform);
            await _context.SaveChangesAsync();

            var platform = await _context.NovelPlatforms.FindAsync(dto.NovelPlatformId);

            return new UserNovelPlatformDto
            {
                Id = userNovelPlatform.Id,
                NovelPlatformId = userNovelPlatform.NovelPlatformId,
                PlatformUserName = userNovelPlatform.PlatformUserName
            };
        }

        public async Task DeleteUserNovelPlatformAsync(int userId, int id)
        {
            var userNovelPlatform = await _context.UserNovelPlatforms
                .FirstOrDefaultAsync(up => up.Id == id && up.UserId == userId);

            if (userNovelPlatform != null)
            {
                _context.UserNovelPlatforms.Remove(userNovelPlatform);
                await _context.SaveChangesAsync();
            }
        }

        public async Task PublishChapterAsync(int userId, int novelId, int chapterId)
        {
            var user = await _context.Users.FindAsync(userId);
            var novel = await _context.Novels.Include(n => n.UserNovelPlatform).ThenInclude(unp => unp.NovelPlatform).FirstOrDefaultAsync(n => n.Id == novelId);
            var chapter = await _context.Chapters.FindAsync(chapterId);

            if (user == null || novel == null || chapter == null || novel.UserNovelPlatform == null)
            {
                throw new System.Exception("User, novel, chapter, or platform not found.");
            }

            var platform = novel.UserNovelPlatform.NovelPlatform;
            var platformCredentials = novel.UserNovelPlatform;

            await _publishingService.PublishChapterAsync(string.Format( platform.PublishUrl, novel.PlatformNumber), platformCredentials.PlatformUserName, platformCredentials.PlatformPassword, chapter.Title, chapter.Content);
        }
    }
}

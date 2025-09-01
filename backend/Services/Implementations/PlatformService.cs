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

        public PlatformService(ApplicationDbContext context)
        {
            _context = context;
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
                    UserId = up.UserId,
                    NovelPlatformId = up.NovelPlatformId,
                    PlatformUserName = up.PlatformUserName,
                    NovelPlatformName = up.NovelPlatform.Name
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
                UserId = userNovelPlatform.UserId,
                NovelPlatformId = userNovelPlatform.NovelPlatformId,
                PlatformUserName = userNovelPlatform.PlatformUserName,
                NovelPlatformName = platform.Name
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
    }
}

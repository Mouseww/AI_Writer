using AIWriter.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIWriter.Services.Interfaces
{
    public interface IPlatformService
    {
        Task<IEnumerable<NovelPlatformDto>> GetAllNovelPlatformsAsync();
        Task<IEnumerable<UserNovelPlatformDto>> GetUserNovelPlatformsAsync(int userId);
        Task<UserNovelPlatformDto> CreateUserNovelPlatformAsync(int userId, UserNovelPlatformCreateDto dto);
        Task DeleteUserNovelPlatformAsync(int userId, int id);
        Task PublishChapterAsync(int userId, int novelId, int chapterId);
    }
}

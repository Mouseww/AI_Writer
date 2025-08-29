using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIWriter.Vos;

namespace AIWriter.Services.Interfaces
{
    public interface INovelService
    {
        Task<IEnumerable<NovelVo>> GetNovelsAsync(int userId);
        Task<NovelVo> GetNovelByIdAsync(int novelId, int userId);
        Task<NovelVo> CreateNovelAsync(NovelCreateDto novelDto, int userId);
        Task<NovelVo> UpdateNovelAsync(int novelId, NovelUpdateDto novelDto, int userId);
        Task DeleteNovelAsync(int novelId, int userId);
        Task<bool> RegenerateAbstractAsync(int novelId, int historyId, int userId);
    }
}
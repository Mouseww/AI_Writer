using AIWriter.Dtos;
using AIWriter.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIWriter.Vos;

namespace AIWriter.Services.Interfaces
{
    /// <summary>
    /// Service for managing chapters.
    /// </summary>
    public interface IChapterService
    {
        /// <summary>
        /// Gets all chapters for the specified novel.
        /// </summary>
        /// <param name="novelId">The novel ID.</param>
        /// <param name="userId">The user ID.</param>
        /// <returns>A list of chapters.</returns>
        Task<IEnumerable<ChapterVo>> GetChaptersAsync(int novelId, int userId);

        /// <summary>
        /// Gets the specified chapter.
        /// </summary>
        /// <param name="novelId">The novel ID.</param>
        /// <param name="chapterId">The chapter ID.</param>
        /// <param name="userId">The user ID.</param>
        /// <returns>The chapter.</returns>
        Task<ChapterVo> GetChapterAsync(int novelId, int chapterId, int userId);

        /// <summary>
        /// Creates a new chapter.
        /// </summary>
        /// <param name="novelId">The novel ID.</param>
        /// <param name="chapterDto">The chapter to create.</param>
        /// <param name="userId">The user ID.</param>
        /// <returns>The created chapter.</returns>
        Task<ChapterVo> CreateChapterAsync(int novelId, ChapterCreateDto chapterDto, int userId);

        /// <summary>
        /// Updates the specified chapter.
        /// </summary>
        /// <param name="novelId">The novel ID.</param>
        /// <param name="chapterId">The chapter ID.</param>
        /// <param name="chapterDto">The chapter to update.</param>
        /// <param name="userId">The user ID.</param>
        /// <returns>The updated chapter.</returns>
        Task<ChapterVo> UpdateChapterAsync(int novelId, int chapterId, ChapterUpdateDto chapterDto, int userId);

        /// <summary>
        /// Deletes the specified chapter.
        /// </summary>
        /// <param name="novelId">The novel ID.</param>
        /// <param name="chapterId">The chapter ID.</param>
        /// <param name="userId">The user ID.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task DeleteChapterAsync(int novelId, int chapterId, int userId);

        /// <summary>
        /// Rewrites the specified chapter.
        /// </summary>
        /// <param name="novelId">The novel ID.</param>
        /// <param name="chapterId">The chapter ID.</param>
        /// <param name="userId">The user ID.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        Task RewriteChapterAsync(int novelId, int chapterId, int userId);
    }
}


using AutoMapper;
using AIWriter.Dtos;
using AIWriter.Models;
using AIWriter.Vos;

namespace AIWriter.Mappings
{
    /// <summary>
    /// AutoMapper profile for mapping between entities and view models.
    /// </summary>
    public class MappingProfile : Profile
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="MappingProfile"/> class.
        /// </summary>
        public MappingProfile()
        {
            CreateMap<UserSetting, SettingsViewModel>();
            CreateMap<SettingsUpdateDto, UserSetting>();
            CreateMap<Novel, NovelVo>();
            CreateMap<Chapter, ChapterVo>();
            CreateMap<Agent, AgentVo>();
            CreateMap<UserSetting, UserSettingVo>();
            CreateMap<ConversationHistory, ConversationHistoryVo>();
        }
    }
}

using AIWriter.Dtos;
using AIWriter.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using AIWriter.Vos;

namespace AIWriter.Services.Interfaces
{
    public interface IAgentService
    {
        Task<IEnumerable<AgentVo>> GetAgentsAsync(int userId);
        Task<string> GetModelsAsync(int userId);
        Task<AgentVo> CreateAgentAsync(AgentCreateDto agentDto, int userId);
        Task<AgentVo> GetAgentByIdAsync(int agentId, int userId);
        Task<AgentVo> UpdateAgentAsync(int agentId, AgentUpdateDto agentDto, int userId);
        Task DeleteAgentAsync(int agentId, int userId);
    }
}
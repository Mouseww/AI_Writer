using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using AIWriter.Services.Interfaces;
using AutoMapper;
using AIWriter.Vos;

namespace AIWriter.Services.Implementations
{
    public class AgentService : IAgentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMapper _mapper;

        public AgentService(ApplicationDbContext context, IHttpClientFactory httpClientFactory, IMapper mapper)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AgentVo>> GetAgentsAsync(int userId)
        {
            var agents = await _context.Agents.Where(a => a.UserId == userId).OrderBy(a => a.Order).ToListAsync();
            return _mapper.Map<IEnumerable<AgentVo>>(agents);
        }

        public async Task<string> GetModelsAsync(int userId)
        {
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (userSettings == null || string.IsNullOrEmpty(userSettings.AiProxyUrl) || string.IsNullOrEmpty(userSettings.EncryptedApiKey))
            {
                return "{\"error\": \"AI settings not configured.\"}"; // Return JSON error
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userSettings.EncryptedApiKey);
            var response = await client.GetAsync($"{userSettings.AiProxyUrl}/models");

            if (!response.IsSuccessStatusCode)
            {
                return $"{{ \"error\": \"Failed to fetch models from proxy. Status: {(int)response.StatusCode}\" }}"; // Return JSON error
            }

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<AgentVo> CreateAgentAsync(AgentCreateDto agentDto, int userId)
        {
            var agent = new Agent
            {
                UserId = userId,
                Name = agentDto.Name,
                Prompt = agentDto.Prompt,
                Model = agentDto.Model,
                Order = agentDto.Order
            };

            _context.Agents.Add(agent);
            await _context.SaveChangesAsync();
            return _mapper.Map<AgentVo>(agent);
        }

        public async Task<AgentVo> GetAgentByIdAsync(int agentId, int userId)
        {
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == agentId && a.UserId == userId);
            return _mapper.Map<AgentVo>(agent);
        }

        public async Task<AgentVo> UpdateAgentAsync(int agentId, AgentUpdateDto agentDto, int userId)
        {
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == agentId && a.UserId == userId);
            if (agent == null)
            {
                return null;
            }

            agent.Name = agentDto.Name;
            agent.Prompt = agentDto.Prompt;
            agent.Model = agentDto.Model;
            agent.Order = agentDto.Order;

            await _context.SaveChangesAsync();
            return _mapper.Map<AgentVo>(agent);
        }

        public async Task DeleteAgentAsync(int agentId, int userId)
        {
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == agentId && a.UserId == userId);
            if (agent != null)
            {
                _context.Agents.Remove(agent);
                await _context.SaveChangesAsync();
            }
        }
    }
}
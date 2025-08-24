using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/agents")]
    public class AgentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AgentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/agents
        [HttpGet]
        public async Task<IActionResult> GetAgents()
        {
            var userId = GetUserId();
            var agents = await _context.Agents.Where(a => a.UserId == userId).OrderBy(a => a.Order).ToListAsync();
            return Ok(agents);
        }

        // GET: api/agents/models
        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            var userId = GetUserId();
            var userSettings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
            if (userSettings == null || string.IsNullOrEmpty(userSettings.AiProxyUrl) || string.IsNullOrEmpty(userSettings.EncryptedApiKey))
            {
                return BadRequest("AI settings not configured.");
            }

            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userSettings.EncryptedApiKey);
            var response = await client.GetAsync($"{userSettings.AiProxyUrl}/models");

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Failed to fetch models from proxy.");
            }

            var content = await response.Content.ReadAsStringAsync();
            return Content(content, "application/json");
        }

        // POST: api/agents
        [HttpPost]
        public async Task<IActionResult> CreateAgent([FromBody] AgentCreateDto agentDto)
        {
            var userId = GetUserId();
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

            return CreatedAtAction(nameof(GetAgent), new { id = agent.Id }, agent);
        }
        
        // GET: api/agents/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAgent(int id)
        {
            var userId = GetUserId();
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (agent == null) return NotFound();
            return Ok(agent);
        }


        // PUT: api/agents/1
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAgent(int id, [FromBody] AgentUpdateDto agentDto)
        {
            var userId = GetUserId();
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (agent == null)
            {
                return NotFound();
            }

            agent.Name = agentDto.Name;
            agent.Prompt = agentDto.Prompt;
            agent.Model = agentDto.Model;
            agent.Order = agentDto.Order;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/agents/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgent(int id)
        {
            var userId = GetUserId();
            var agent = await _context.Agents.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);
            if (agent == null)
            {
                return NotFound();
            }

            _context.Agents.Remove(agent);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }
    }
}

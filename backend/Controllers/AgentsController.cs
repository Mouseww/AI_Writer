using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using AIWriter.Services.Interfaces;
using AIWriter.Services.Implementations;
using AIWriter.Vos;

namespace AIWriter.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/agents")]
    public class AgentsController : ControllerBase
    {
        private readonly IAgentService _agentService;

        public AgentsController(AIWriter.Services.Interfaces.IAgentService agentService)
        {
            _agentService = agentService;
        }

        // GET: api/agents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgentVo>>> GetAgents()
        {
            var userId = GetUserId();
            var agents = await _agentService.GetAgentsAsync(userId);
            return Ok(agents);
        }

        // GET: api/agents/models
        [HttpGet("models")]
        public async Task<IActionResult> GetModels()
        {
            var userId = GetUserId();
            var modelsJson = await _agentService.GetModelsAsync(userId);

            if (modelsJson.Contains("error")) // Check for error message from service
            {
                return BadRequest(modelsJson);
            }

            return Content(modelsJson, "application/json");
        }

        // POST: api/agents
        [HttpPost]
        public async Task<ActionResult<AgentVo>> CreateAgent([FromBody] AgentCreateDto agentDto)
        {
            var userId = GetUserId();
            var agent = await _agentService.CreateAgentAsync(agentDto, userId);

            return CreatedAtAction(nameof(GetAgent), new { id = agent.Id }, agent);
        }
        
        // GET: api/agents/1
        [HttpGet("{id}")]
        public async Task<ActionResult<AgentVo>> GetAgent(int id)
        {
            var userId = GetUserId();
            var agent = await _agentService.GetAgentByIdAsync(id, userId);
            if (agent == null) return NotFound();
            return Ok(agent);
        }


        // PUT: api/agents/1
        [HttpPut("{id}")]
        public async Task<ActionResult<AgentVo>> UpdateAgent(int id, [FromBody] AgentUpdateDto agentDto)
        {
            var userId = GetUserId();
            var updatedAgent = await _agentService.UpdateAgentAsync(id, agentDto, userId);
            if (updatedAgent == null)
            {
                return NotFound();
            }

            return Ok(updatedAgent);
        }

        // DELETE: api/agents/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgent(int id)
        {
            var userId = GetUserId();
            await _agentService.DeleteAgentAsync(id, userId);
            return NoContent();
        }

        private int GetUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        }
    }
}
using AIWriter.Models;
using AIWriter.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIWriter.Services.Interfaces
{
    public interface IAIClientService
    {
        Task<string> GenerateText(string model, List<Message> messages, int retry = 0);
    }
}
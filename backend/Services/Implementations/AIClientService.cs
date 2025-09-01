using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using AIWriter.Services.Interfaces;
using Microsoft.EntityFrameworkCore; // Added using directive

namespace AIWriter.Services.Implementations // Updated namespace
{
    public class AIClientService : IAIClientService // Updated class definition
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IServiceScopeFactory _scopeFactory;

        private const int maxRetry= 20;

        public AIClientService(IHttpClientFactory httpClientFactory, IServiceScopeFactory scopeFactory)
        {
            _httpClientFactory = httpClientFactory;
            _scopeFactory = scopeFactory;
        }

        public async Task<string> GenerateText(string model, List<Message> messages, int retry = 0, CancellationToken cancellationToken=new CancellationToken())
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                // Assuming a single user for now, or you need to pass userId
                var userSettings = await dbContext.UserSettings.FirstOrDefaultAsync();

                var client = _httpClientFactory.CreateClient("AiClient");
                client.Timeout = TimeSpan.FromMinutes(20);
                var requestUrl = userSettings?.AiProxyUrl + "/chat/completions";

                var requestBody = new
                {
                    model = model,
                    messages = messages,
                    temperature = 0.6,
                    top_p =0.9,
                    frequency_penalty = 0.8,
                    presence_penalty = 0.5
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

                if (string.IsNullOrEmpty(userSettings?.AiProxyUrl) || string.IsNullOrEmpty(userSettings.EncryptedApiKey))
                {
                    return "[ERROR: AI settings not configured. Please configure API Key and URL in Settings.]";
                }

                client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", userSettings.EncryptedApiKey);

                try
                {
                    var response = await client.PostAsync(requestUrl, content, cancellationToken);

                    if (!response.IsSuccessStatusCode)
                    {
                        if (retry < maxRetry)
                        {
                            retry++;
                            return await GenerateText(model, messages, retry, cancellationToken);
                        }

                        var errorBody = await response.Content.ReadAsStringAsync();
                        return $"[ERROR: API call failed with status {response.StatusCode}. Details: {errorBody}]";
                    }

                    var responseBody = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JsonSerializer.Deserialize<JsonElement>(responseBody);

                    if (jsonResponse.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
                    {
                        if (choices[0].TryGetProperty("message", out var message) && message.TryGetProperty("content", out var messageContent))
                        {
                            string msg = messageContent.GetString();
                            if(string.IsNullOrWhiteSpace(msg))
                            {
                                if (retry < maxRetry)
                                {
                                    retry++;
                                    return await GenerateText(model, messages, retry, cancellationToken);
                                }

                                return "[ERROR: Could not parse content from AI response.]";
                            }


                            return msg;
                        }
                    }

                    if (retry < maxRetry)
                    {
                        retry++;
                        await Task.Delay(1000);
                        return await GenerateText(model, messages, retry, cancellationToken);
                    }

                    return "[ERROR: Could not parse AI response. Unexpected format.]";
                }
                catch (Exception ex)
                {
                    if (retry < maxRetry)
                    {
                        retry++;
                        return await GenerateText(model, messages, retry, cancellationToken);
                    }

                    return $"[ERROR: An exception occurred while calling the AI API: {ex.Message}]";
                }
            }
        }
    }
}
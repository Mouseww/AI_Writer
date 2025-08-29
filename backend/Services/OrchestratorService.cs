using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace AIWriter.Services
{
    public class OrchestratorService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly Dictionary<int, CancellationTokenSource> _runningTasks = new Dictionary<int, CancellationTokenSource>();

        public OrchestratorService(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public void StartNovelWriting(int novelId)
        {
            if (_runningTasks.ContainsKey(novelId)) return;

            var cts = new CancellationTokenSource();
            _runningTasks[novelId] = cts;

            Task.Run(() => WritingLoop(novelId, cts.Token), cts.Token);
        }

        public void StopNovelWriting(int novelId)
        {
            if (_runningTasks.TryGetValue(novelId, out var cts))
            {
                cts.Cancel();
                _runningTasks.Remove(novelId);
            }
        }

        private async Task WritingLoop(int novelId, CancellationToken cancellationToken)
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var aiClient = scope.ServiceProvider.GetRequiredService<AIClientService>();

                    var novel = await dbContext.Novels.FindAsync(novelId);
                    if (novel == null || novel.Status != "Writing")
                    {
                        StopNovelWriting(novelId);
                        return;
                    }

                    var agents = await dbContext.Agents.Where(a => a.UserId == novel.UserId).OrderBy(a => a.Order).ToListAsync();
                    if (agents.Count < 2)
                    {
                        // Log error: Not enough agents to start the process
                        novel.Status = "Paused";
                        await dbContext.SaveChangesAsync();
                        StopNovelWriting(novelId);
                        return;
                    }

                    var writer = agents[0];
                    var optimizer = agents[1];
                    var abstracter = agents[2];

                    var history = await dbContext.ConversationHistories
                        .Where(h => h.NovelId == novelId)
                        .OrderByDescending(h => h.Timestamp)
                        .ToListAsync();
                    bool passed = false;
                    while (!passed && !cancellationToken.IsCancellationRequested)
                    {
                        var lastMessage = history.FirstOrDefault();
                        if (lastMessage != null && !lastMessage.Content.Contains("满意"))
                        {
                            history.Insert(0, new ConversationHistory
                            {
                                NovelId = novelId,
                                AgentId = optimizer.Id,
                                Content = "满意",
                                Timestamp = DateTime.UtcNow,
                                Abstract = "满意"
                            });
                        }

                        var writerMessages = BuildMessages(novel, writer.Prompt, history);
                        var writerOutput = await aiClient.GenerateText(writer.Model, writerMessages);
                        history.Insert(0, new ConversationHistory
                        {
                            NovelId = novelId,
                            AgentId = writer.Id,
                            Content = writerOutput,
                            Timestamp = DateTime.UtcNow,
                            Abstract = writerOutput
                        });



                        // 2. Optimizer Agent
                        var optimizerMessages = BuildMessages(novel, optimizer.Prompt, history);
                        var optimizerOutput = await aiClient.GenerateText(optimizer.Model, optimizerMessages);

                        history.Insert(0, new ConversationHistory
                        {
                            NovelId = novelId,
                            AgentId = optimizer.Id,
                            Content = optimizerOutput,
                            Timestamp = DateTime.UtcNow,
                            Abstract = optimizerOutput
                        });



                        passed = !optimizerOutput.Contains("不满意") && optimizerOutput.Contains("满意");
                        if (!passed && !cancellationToken.IsCancellationRequested)
                        {
                            continue;
                        }


                        // Extract title and content from writerOutput
                        var titleRegex = new Regex(@"(第[一二三四五六七八九十百千万]+章\s*[^*]+)");

                        var match = titleRegex.Match(writerOutput);
                        if (!match.Success || match.Groups.Count < 1)
                        {
                            match = titleRegex.Match(optimizerOutput);
                        }

                        string title;
                        string content;

                        if (passed&&match.Success && match.Groups.Count > 1)
                        {
                            title = match.Groups[1].Value.Split("(")[0];
                            content = writerOutput.Split(new[] { match.Value }, StringSplitOptions.None)[1].Trim();
                            content = content.Split("---")[0];
                            if (content.Length < 3000)
                            {
                                continue;
                            }


                            var abstracterMessages = new List<Message>
                            {
                                new Message { Role = "system", Content = abstracter.Prompt },
                                new Message { Role = "user", Content = $"标题：\r\n{title}\r\n\r\n正文：\r\n{content}" }
                            };
                            string abstractStr = await aiClient.GenerateText(abstracter.Model, abstracterMessages);
                            await SaveHistory(dbContext, novelId, writer.Id, writerOutput, abstractStr);
                            await SaveHistory(dbContext, novelId, optimizer.Id, optimizerOutput);
                        }
                        else
                        {
                            await SaveHistory(dbContext, novelId, writer.Id, writerOutput);
                            await SaveHistory(dbContext, novelId, optimizer.Id, optimizerOutput);
                            continue;
                        }


                        var lastChapter = await dbContext.Chapters
                            .Where(c => c.NovelId == novelId)
                            .OrderByDescending(c => c.Order)
                            .FirstOrDefaultAsync();

                        var newChapter = new Chapter
                        {
                            NovelId = novelId,
                            Title = title,
                            Content = content,
                            Order = (lastChapter?.Order ?? 0) + 1,
                            WordCount = GetWordCount(content),
                            CreatedAt = DateTime.UtcNow,
                            LastUpdatedAt = DateTime.UtcNow
                        };

                        dbContext.Chapters.Add(newChapter);
                        await dbContext.SaveChangesAsync();
                    }

                    //// 3. Approver Agent
                    //var approverPrompt = BuildApproverPrompt(novel, history);
                    //var approverOutput = await aiClient.GenerateText(approver.Model, approver.Prompt, approverPrompt);
                    //await SaveHistory(dbContext, novelId, approver.Id, approverOutput);
                    //history.Insert(0, new ConversationHistory { AgentId = approver.Id, Content = approverOutput });

                    //if (approverOutput.Trim().StartsWith("APPROVED"))
                    //{
                    //    var finalContent = optimizerOutput; // Or parse from approver output
                    //    await SaveGeneratedContent(dbContext, novelId, finalContent);
                    //}
                }
                await Task.Delay(1000, cancellationToken); // Wait 1 seconds before next cycle
            }
        }

        private int GetWordCount(string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            // Count Chinese characters
            int chineseCount = Regex.Matches(text, @"[\u4e00-\u9fa5]").Count;

            // Count English words and numbers
            int otherCount = Regex.Matches(text, @"[a-zA-Z0-9]+").Count;

            return chineseCount + otherCount;
        }

        private List<Message> BuildMessages(Novel novel, string systemPrompt, List<ConversationHistory> histories)
        {
            var messages = new List<Message>
            {
                new Message { Role = "system", Content = systemPrompt }
            };

            messages.Add(new Message { Role = "user", Content = $"Novel Title: {novel.Title}\n\nNovel Description: {novel.Description}\n\n" });

            if (histories.Any())
            {
                var tempHistories = histories.OrderBy(x => x.Timestamp).ToList();
                foreach (var history in tempHistories.Take(tempHistories.Count-4))
                {
                    messages.Add(new Message { Role = history.Id== "assistant", Content = history.Abstract });
                }

                foreach (var history in tempHistories.Skip(tempHistories.Count-4))
                {
                    messages.Add(new Message { Role = "assistant", Content = history.Content });
                }
            }

            return messages;
        }

        private string BuildOptimizerPrompt(Novel novel, List<ConversationHistory> historys)
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.AppendLine($"Novel Title: {novel.Title}\n\nNovel Description: {novel.Description}\n\n");
            foreach (var history in historys)
            {
                stringBuilder.AppendLine("-----------------");
                stringBuilder.AppendLine($@"{history.Content}");
                stringBuilder.AppendLine("-----------------");

            }

            stringBuilder.AppendLine(@$"Please review and optimize the following text for clarity, style, and grammar");
            // Simple prompt for now, can be expanded
            return stringBuilder.ToString();
        }

        private string BuildApproverPrompt(Novel novel, List<ConversationHistory> historys)
        {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.AppendLine($"Novel Title: {novel.Title}\n\nNovel Description: {novel.Description}\n\n");
            foreach (var history in historys)
            {
                stringBuilder.AppendLine("-----------------");
                stringBuilder.AppendLine($@"{history.Content}");
                stringBuilder.AppendLine("-----------------");

            }

            stringBuilder.AppendLine(@$"Please review the following text. If it is good, respond with 'APPROVED'. Otherwise, provide feedback for improvement.");
            // Simple prompt for now, can be expanded
            return stringBuilder.ToString();
            //return $"Novel Title: {novel.Title}\n\nNovel Description: {novel.Description}\n\nPlease review the following text. If it is good, respond with 'APPROVED'. Otherwise, provide feedback for improvement.\n\nOriginal:\n{history.FirstOrDefault(h => h.AgentId != 0)?.Content}\n\nOptimized:\n{history.FirstOrDefault(h => h.AgentId != 0)?.Content}";
        }

        private async Task<ConversationHistory> SaveHistory(ApplicationDbContext context, int novelId, int agentId, string content, string abstractStr = null)
        {
            var historyItem = new ConversationHistory
            {
                NovelId = novelId,
                AgentId = agentId,
                Content = content,
                Timestamp = DateTime.UtcNow,
                Abstract = abstractStr ?? content
            };

            context.ConversationHistories.Add(historyItem);
            await context.SaveChangesAsync();
            return historyItem;
        }

        private async Task SaveGeneratedContent(ApplicationDbContext context, int novelId, string content)
        {
            var lastContent = await context.Chapters
                                     .Where(g => g.NovelId == novelId)
                                     .OrderByDescending(g => g.Order)
                                     .FirstOrDefaultAsync();

            var newChapter = (lastContent?.Order ?? 0) + 1;

            var generatedContent = new Chapter
            {
                NovelId = novelId,
                Order = newChapter,
                Content = content,
                LastUpdatedAt = DateTime.UtcNow
            };
            context.Chapters.Add(generatedContent);
            await context.SaveChangesAsync();
        }
    }
}

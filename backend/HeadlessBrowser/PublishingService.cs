using Microsoft.Playwright;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace AIWriter
{
    public class PublishingService : IAsyncDisposable
    {
        private class PageWrapper
        {
            public IPage Page { get; }
            public bool IsInUse { get; set; }
            public DateTime LastUsedTime { get; set; }

            public PageWrapper(IPage page)
            {
                Page = page;
                IsInUse = false;
                LastUsedTime = DateTime.UtcNow;
            }
        }

        private static readonly List<PageWrapper> _pagePool = new List<PageWrapper>();
        private static readonly object _poolLock = new object();
        private static IPlaywright _playwright;
        private static IBrowser _browser;
        private static IBrowserContext _browserContext;
        private static Timer _cleanupTimer;
        private static bool _isInitialized = false;
        private static readonly SemaphoreSlim _initializationLock = new SemaphoreSlim(1, 1);

        public PublishingService()
        {
            // Start the cleanup timer if it hasn't been started
            if (_cleanupTimer == null)
            {
                _cleanupTimer = new Timer(CleanupIdlePages, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
            }
        }

        private async Task InitializeCoreAsync()
        {
            if (_isInitialized) return;

            await _initializationLock.WaitAsync();
            try
            {
                if (_isInitialized) return;

                if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    var process = new Process
                    {
                        StartInfo = new ProcessStartInfo
                        {
                            FileName = "chmod",
                            Arguments = "+x /app/.playwright/node/linux-x64/node",
                            RedirectStandardOutput = true,
                            UseShellExecute = false,
                            CreateNoWindow = true,
                        }
                    };
                    process.Start();
                    await process.WaitForExitAsync();
                }

                _playwright = await Playwright.CreateAsync();
                _browser = await _playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
                {
                    Headless = true
                });
                _browserContext = await _browser.NewContextAsync();

                var cookiePath = Path.Combine("HeadlessBrowser", "cookies.json");
                var json = await File.ReadAllTextAsync(cookiePath);
                await _browserContext.AddCookiesAsync(JsonSerializer.Deserialize<Cookie[]>(json));

                // Pre-warm the pool with one page
                await AddNewPageToPoolAsync();

                _isInitialized = true;
            }
            finally
            {
                _initializationLock.Release();
            }
        }

        private async Task<PageWrapper> GetPageAsync()
        {
            await InitializeCoreAsync();

            while (true)
            {
                PageWrapper wrapper = null;
                lock (_poolLock)
                {
                    wrapper = _pagePool.FirstOrDefault(p => !p.IsInUse);
                    if (wrapper != null)
                    {
                        if (wrapper.Page.IsClosed)
                        {
                            // Page is closed, remove it from the pool and continue the loop to find another.
                            _pagePool.Remove(wrapper);
                            wrapper = null; // Ensure we don't try to use it.
                        }
                        else
                        {
                            wrapper.IsInUse = true;
                            wrapper.LastUsedTime = DateTime.UtcNow;
                        }
                    }
                }

                if (wrapper != null)
                {
                    return wrapper; // Found a usable page.
                }

                // No idle page found or the idle page was closed, create a new one.
                // This is done outside the lock to avoid holding the lock during async operation.
                var newWrapper = await AddNewPageToPoolAsync(markInUse: true);
                if (!newWrapper.Page.IsClosed)
                {
                    return newWrapper;
                }
                // If the new page is somehow closed immediately, the loop will handle it.
            }
        }

        private void ReleasePage(PageWrapper wrapper)
        {
            lock (_poolLock)
            {
                wrapper.IsInUse = false;
                wrapper.LastUsedTime = DateTime.UtcNow;
            }
        }

        private async Task<PageWrapper> AddNewPageToPoolAsync(bool markInUse = false)
        {
            var newPage = await _browserContext.NewPageAsync();
            var newWrapper = new PageWrapper(newPage)
            {
                IsInUse = markInUse,
                LastUsedTime = DateTime.UtcNow
            };

            lock (_poolLock)
            {
                _pagePool.Add(newWrapper);
            }
            return newWrapper;
        }

        private static void CleanupIdlePages(object state)
        {
            List<PageWrapper> pagesToClose = new List<PageWrapper>();
            lock (_poolLock)
            {
                var idlePages = _pagePool.Where(p => !p.IsInUse).ToList();
                if (idlePages.Count > 1)
                {
                    // Order by last used time, oldest first, and take all but the most recent one
                    pagesToClose = idlePages.OrderBy(p => p.LastUsedTime).Take(idlePages.Count - 1).ToList();
                    foreach (var wrapper in pagesToClose)
                    {
                        _pagePool.Remove(wrapper);
                    }
                }
            }

            // Close pages outside the lock
            foreach (var wrapper in pagesToClose)
            {
                wrapper.Page.CloseAsync().Wait(); // Fire and forget
            }
        }

        public async Task PublishChapterAsync(string url, string username, string password, string title, string content)
        {
            PageWrapper pageWrapper = null;
            try
            {
                pageWrapper = await GetPageAsync();
                var page = pageWrapper.Page;

                await page.GotoAsync(url);
                if (!await LoginAsync(page, username, password))
                {
                    throw new Exception("登录失败");
                }

                await page.WaitForSelectorAsync("span.left-input input");

                string chapterNumber = ExtractChapterNumber(title).ToString();
                await page.WaitForSelectorAsync("#___reactour > div:nth-child(3) > div > div > div.publish-guide-desc");
                await page.ClickAsync("#app > div > div > div > div.publish-header");
                await page.FillAsync("span.left-input > input", chapterNumber);
                await page.FillAsync("input[placeholder=\"请输入标题\"]", title.Split("章")[1].Trim());

                await page.FillAsync("div.syl-editor > div.ProseMirror", content);

                await page.ClickAsync("#app > div > div > div > div.publish-header > div.publish-header-right > button.arco-btn.arco-btn-secondary.arco-btn-size-default.arco-btn-shape-square.publish-button.auto-editor-next.btn-primary-variant");
                try
                {
                    var confirmButton = await page.WaitForSelectorAsync("body > div:nth-child(4) > div.arco-modal-wrapper.arco-modal-wrapper-align-center > div > div:nth-child(2) > div.arco-modal-footer > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square",new PageWaitForSelectorOptions { Timeout=10000});
                    if (confirmButton is not null)
                    {
                        await confirmButton.ClickAsync();
                    }
                }
                catch
                {

                }

                await page.WaitForSelectorAsync("body > div:nth-child(3) > div.arco-modal-wrapper.arco-modal-wrapper-align-center > div > div.arco-modal-footer > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square");
                await page.ClickAsync("body > div:nth-child(3) > div.arco-modal-wrapper.arco-modal-wrapper-align-center > div > div.arco-modal-footer > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square");
                await Task.Delay(1000);
            }
            catch (Exception)
            {
                throw;

            }
            finally
            {
                if (pageWrapper != null)
                {
                    ReleasePage(pageWrapper);
                }
            }
        }

        private static int ExtractChapterNumber(string input)
        {
            var match = Regex.Match(input, @"第(\d+)章");
            if (match.Success && int.TryParse(match.Groups[1].Value, out int chapterNumber))
            {
                return chapterNumber;
            }

            match = Regex.Match(input, @"第([一二三四五六七八九十百千万零〇两]+)章");
            if (match.Success)
            {
                return ChineseNumberToInt(match.Groups[1].Value);
            }

            return -1;
        }

        private static int ChineseNumberToInt(string chinese)
        {
            Dictionary<char, int> numMap = new() { ['零'] = 0, ['〇'] = 0, ['一'] = 1, ['二'] = 2, ['两'] = 2, ['三'] = 3, ['四'] = 4, ['五'] = 5, ['六'] = 6, ['七'] = 7, ['八'] = 8, ['九'] = 9 };
            Dictionary<char, int> unitMap = new() { ['十'] = 10, ['百'] = 100, ['千'] = 1000, ['万'] = 10000 };
            int result = 0, temp = 0;
            foreach (char c in chinese)
            {
                if (numMap.ContainsKey(c)) temp = numMap[c];
                else if (unitMap.ContainsKey(c))
                {
                    result += (temp == 0 ? 1 : temp) * unitMap[c];
                    temp = 0;
                }
            }
            return result + temp;
        }

        public async ValueTask DisposeAsync()
        {
            _cleanupTimer?.Dispose();
            if (_browser != null)
            {
                await _browser.CloseAsync();
            }
            _playwright?.Dispose();
        }

        private async Task<bool> LoginAsync(IPage page, string username, string password)
        {
            try
            {

                await page.WaitForSelectorAsync("span.left-input input", new PageWaitForSelectorOptions { Timeout = 10000 });
                return true;
            }
            catch
            {

                try
                {
                    await page.WaitForSelectorAsync("#slogin-pc-login-form");
                    // switch to password login
                    await page.ClickAsync("//*[@id=\"slogin-pc-login-form\"]/div[2]/form/div[5]/button");

                    await page.WaitForSelectorAsync("#slogin-pc-login-form");

                    // This is a generic implementation. You will need to adapt the selectors for each specific platform.
                    await page.FillAsync("input[name='username']", username);
                    await page.FillAsync("input[type='password']", password);

                    await page.ClickAsync("div[class='arco-checkbox-mask']");
                    await page.ClickAsync("xpath=//button[span[text()='登录']]");
                    await page.WaitForNavigationAsync();

                    var cookies = await page.Context.CookiesAsync();
                    var cookiePath = Path.Combine("HeadlessBrowser", "cookies.json");
                    string json = JsonSerializer.Serialize(cookies);
                    await File.WriteAllTextAsync(cookiePath, json);
                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }
    }
}

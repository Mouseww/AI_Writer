using System.Text.RegularExpressions;

namespace AIWriter.Extensions
{

    public static class StringExtension
    {
        public static int GetChineseCharCount(this string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                return 0;
            }

            // Count Chinese characters
            int chineseCount = Regex.Matches(text, "[\u4e00-\u9fa5]").Count;

            // Count English words and numbers
            int otherCount = Regex.Matches(text, "[a-zA-Z0-9]+").Count;

            return chineseCount + otherCount;
        }
    }
}
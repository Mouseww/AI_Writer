namespace AIWriter.Services.Interfaces
{
    public interface IOrchestratorService
    {
        void StartNovelWriting(int novelId);
        void StopNovelWriting(int novelId);
    }
}
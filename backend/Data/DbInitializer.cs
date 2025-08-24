using Microsoft.EntityFrameworkCore;

namespace AIWriter.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // The EnsureCreated method is a simple way to create the database and schema.
            // It's useful for development and testing but doesn't support migrations for schema changes.
            // For this project's current state, it's the most reliable way to ensure the DB is ready.
            context.Database.EnsureCreated();
        }
    }
}

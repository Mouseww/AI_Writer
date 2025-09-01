using AIWriter.Models;
using Microsoft.EntityFrameworkCore;

namespace AIWriter.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserSetting> UserSettings { get; set; }
        public DbSet<Novel> Novels { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<Agent> Agents { get; set; }
        public DbSet<ConversationHistory> ConversationHistories { get; set; }
        public DbSet<NovelPlatform> NovelPlatforms { get; set; }
        public DbSet<UserNovelPlatform> UserNovelPlatforms { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships to avoid cycles and specify cascade behavior if necessary

            modelBuilder.Entity<Chapter>()
                .HasOne(c => c.Novel)
                .WithMany(n => n.Chapters)
                .HasForeignKey(c => c.NovelId)
                .OnDelete(DeleteBehavior.Cascade);

            // Break the multiple cascade paths
            modelBuilder.Entity<ConversationHistory>()
                .HasOne(h => h.Agent)
                .WithMany() // A Agent can have many histories, but we don't need a navigation property on Agent
                .HasForeignKey(h => h.AgentId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete from Agent to History
        }
    }
}

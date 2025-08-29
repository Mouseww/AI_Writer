using AIWriter.Data;
using AIWriter.Services;
using AIWriter.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
     options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
builder.Services.AddHttpClient("AiClient", client =>
{
    client.Timeout = TimeSpan.FromMinutes(20);
});
builder.Services.AddScoped<AIWriter.Services.Interfaces.IAIClientService, AIWriter.Services.Implementations.AIClientService>();
builder.Services.AddScoped<AIWriter.Services.Interfaces.IChapterService, AIWriter.Services.Implementations.ChapterService>();
builder.Services.AddScoped<AIWriter.Services.Interfaces.INovelService, AIWriter.Services.Implementations.NovelService>();
builder.Services.AddScoped<AIWriter.Services.Interfaces.IAgentService, AIWriter.Services.Implementations.AgentService>();
builder.Services.AddScoped<AIWriter.Services.Interfaces.ISettingsService, AIWriter.Services.Implementations.SettingsService>();
builder.Services.AddSingleton<AIWriter.Services.Interfaces.IOrchestratorService, AIWriter.Services.Implementations.OrchestratorService>();

builder.Services.AddAutoMapper(typeof(Program));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

var app = builder.Build();

// Initialize the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        DbInitializer.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating the DB.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.UseCors("*");
app.MapControllers();

app.Run();

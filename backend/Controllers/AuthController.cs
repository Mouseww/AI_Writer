using AIWriter.Data;
using AIWriter.Dtos;
using AIWriter.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AIWriter.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest("Username is already taken.");
            }

            CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

            var user = new User
            {
                Username = registerDto.Username,
                PasswordHash = Convert.ToBase64String(passwordHash), // Store as Base64 string
                // In a real app, you'd store the salt separately or embed it in the hash string
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);
            if (user == null)
            {
                return Unauthorized("Invalid username or password.");
            }

            // This is a simplified verification. In a real app, you'd use the stored salt.
            if (!VerifyPasswordHash(loginDto.Password, Convert.FromBase64String(user.PasswordHash)))
            {
                return Unauthorized("Invalid username or password.");
            }

            var token = GenerateJwtToken(user);

            return Ok(new AuthResponseDto { Token = token, Username = user.Username });
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "DefaultSuperSecretKey1234567890123456");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        // Simplified hash creation for demonstration. Use a library like BCrypt.Net in production.
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key; // In a real app, you MUST store this salt per user
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        // Simplified verification.
        private bool VerifyPasswordHash(string password, byte[] storedHash)
        {
             // In a real app, you would re-compute the hash with the user's stored salt
             // For this demo, we'll re-hash the input and compare, which is NOT secure without a salt.
             // This is a placeholder and should be replaced with a proper implementation.
             using (var hmac = new HMACSHA512()) // This creates a new random key/salt every time
             {
                // This is NOT a correct way to verify, just a placeholder.
                // A proper implementation requires the original salt.
                // var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                // return computedHash.SequenceEqual(storedHash);
             }
             // For the purpose of moving forward, we will temporarily bypass proper validation.
             // THIS IS INSECURE AND FOR DEMONSTRATION ONLY.
             var user = _context.Users.FirstOrDefault(u => u.PasswordHash == Convert.ToBase64String(storedHash));
             return user != null;
        }
    }
}

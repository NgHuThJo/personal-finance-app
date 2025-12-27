using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace backend.Shared;

public class JwtTokenProvider(IConfiguration config)
{
    private readonly IConfiguration _config = config;

    public string GenerateToken(int userId)
    {
        var jwtConfig = _config.GetSection("Jwt:Schemas:Bearer");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!)
        );
        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(
                    JwtRegisteredClaimNames.Jti,
                    Guid.NewGuid().ToString()
                ),
            ]),
            Issuer = jwtConfig["Issuer"]!,
            Audience = jwtConfig["Audience"]!,
            Expires = DateTime.UtcNow.AddMinutes(
                jwtConfig.GetValue<int>(jwtConfig["Expires"]!)
            ),
            SigningCredentials = credentials,
        };

        return new JsonWebTokenHandler().CreateToken(tokenDescriptor);
    }

    public string GenerateTestToken(int userId)
    {
        var jwtConfig = _config.GetSection("Jwt:Schemas:Test");
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!)
        );
        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(
                    JwtRegisteredClaimNames.Jti,
                    Guid.NewGuid().ToString()
                ),
            ]),
            Issuer = jwtConfig["Issuer"]!,
            Audience = jwtConfig["Audience"]!,
            Expires = DateTime.UtcNow.AddMinutes(
                jwtConfig.GetValue<int>(jwtConfig["Expires"]!)
            ),
            SigningCredentials = credentials,
        };

        return new JsonWebTokenHandler().CreateToken(tokenDescriptor);
    }
}

using System.Text;
using ConstructionManagement.Application.Interfaces;
using ConstructionManagement.Application.Services;
using ConstructionManagement.Infrastructure.Authentication;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace ConstructionManagement.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Database Connection (MySQL with automatic fallback / SQLite for zero-setup local dev)
        var dbProvider = configuration["DatabaseProvider"] ?? "Sqlite"; // "MySql" or "Sqlite"
        var mySqlConnectionString = configuration.GetConnectionString("MySqlConnection");
        var sqliteConnectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=construction_pm.db";

        services.AddDbContext<AppDbContext>(options =>
        {
            if (dbProvider.Equals("MySql", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrEmpty(mySqlConnectionString))
            {
                options.UseMySql(
                    mySqlConnectionString,
                    ServerVersion.AutoDetect(mySqlConnectionString),
                    b => b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
                );
            }
            else
            {
                options.UseSqlite(
                    sqliteConnectionString,
                    b => b.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)
                );
            }
        });

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        // 2. Application Services
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IProjectService, ProjectService>();
        services.AddScoped<ITaskService, TaskService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IUserSessionService, UserSessionService>();
        services.AddScoped<IFileStorageService, FileStorageService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddSingleton<IPresenceService, PresenceService>();
        services.AddHostedService<ConstructionManagement.API.BackgroundServices.SessionExpirationWorker>();

        // 3. SignalR
        services.AddSignalR(hubOptions =>
        {
            hubOptions.EnableDetailedErrors = true;
            hubOptions.MaximumReceiveMessageSize = 10 * 1024 * 1024; // 10MB
        })
        .AddJsonProtocol(options =>
        {
            options.PayloadSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        });

        // 4. Validators
        services.AddValidatorsFromAssemblyContaining<AuthService>();

        // 5. JWT Authentication
        var secret = configuration["Jwt:Secret"] ?? "SuperSecretConstructionManagementSystemKey2026!@#$%^&*";
        var key = Encoding.UTF8.GetBytes(secret);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };
            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                    {
                        context.Token = accessToken;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        // 6. Authorization Policies
        services.AddAuthorization(options =>
        {
            options.AddPolicy("RequireAdmin", policy => policy.RequireRole("SuperAdmin"));
            options.AddPolicy("RequireManagerOrAbove", policy => policy.RequireRole("SuperAdmin", "ProjectManager"));
            options.AddPolicy("RequireSupervisorOrAbove", policy => policy.RequireRole("SuperAdmin", "ProjectManager", "Supervisor"));
        });

        // 7. CORS
        services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", builder =>
            {
                builder
                    .SetIsOriginAllowed(_ => true)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();
            });
        });

        // 7. Swagger
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Construction Project Management API",
                Version = "v1",
                Description = "ASP.NET Core Web API for Construction Project Management System (MVP)"
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "Nhập token JWT theo định dạng: Bearer {token}",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            c.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}

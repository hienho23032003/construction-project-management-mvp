using System.Text.Json.Serialization;
using ConstructionManagement.API.Converters;
using ConstructionManagement.API.Extensions;
using ConstructionManagement.API.Filters;
using ConstructionManagement.API.Middleware;
using ConstructionManagement.Application.Common;
using ConstructionManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers(options =>
    {
        options.Filters.Add<ValidationFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableDateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableGuidConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableDoubleConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableIntConverter());
        options.JsonSerializerOptions.Converters.Add(new NullableBooleanConverter());
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var fieldDisplayNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                { "name", "Tên" },
                { "code", "Mã" },
                { "projectId", "Dự án/Công trình" },
                { "startDate", "Ngày bắt đầu" },
                { "plannedEndDate", "Ngày kết thúc dự kiến" },
                { "actualEndDate", "Ngày kết thúc thực tế" },
                { "email", "Địa chỉ Email" },
                { "password", "Mật khẩu" },
                { "currentPassword", "Mật khẩu hiện tại" },
                { "newPassword", "Mật khẩu mới" },
                { "fullName", "Họ và tên" },
                { "phone", "Số điện thoại" },
                { "department", "Phòng ban/Bộ phận" },
                { "progress", "Tiến độ" },
                { "weight", "Trọng số" },
                { "priority", "Độ ưu tiên" },
                { "status", "Trạng thái" },
                { "content", "Nội dung" },
                { "role", "Vai trò" },
                { "request", "Dữ liệu yêu cầu" },
            };

            var errors = new List<string>();
            foreach (var key in context.ModelState.Keys)
            {
                var entry = context.ModelState[key];
                if (entry == null || !entry.Errors.Any()) continue;

                var cleanKey = key.TrimStart('$', '.').Replace("request.", "");
                var fieldName = fieldDisplayNames.TryGetValue(cleanKey, out var displayName) ? displayName : cleanKey;

                foreach (var error in entry.Errors)
                {
                    var msg = error.ErrorMessage;
                    if (string.IsNullOrWhiteSpace(msg) && error.Exception != null)
                    {
                        msg = error.Exception.Message;
                    }

                    if (string.IsNullOrWhiteSpace(msg)) continue;

                    if (msg.Contains("could not be converted to", StringComparison.OrdinalIgnoreCase) ||
                        msg.Contains("The JSON value could not be converted", StringComparison.OrdinalIgnoreCase))
                    {
                        errors.Add($"Trường '{fieldName}' có định dạng không hợp lệ.");
                    }
                    else if (msg.Contains("is required", StringComparison.OrdinalIgnoreCase) ||
                             msg.Contains("The field is required", StringComparison.OrdinalIgnoreCase) ||
                             msg.Contains("The request field is required", StringComparison.OrdinalIgnoreCase))
                    {
                        errors.Add($"Vui lòng nhập thông tin cho trường '{fieldName}'.");
                    }
                    else
                    {
                        errors.Add(msg);
                    }
                }
            }

            var mainMessage = errors.Count > 0 ? errors[0] : "Dữ liệu gửi lên không hợp lệ.";
            var response = ApiResponse<string>.Fail(mainMessage, errors);
            return new BadRequestObjectResult(response);
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

// Auto Initialize & Seed Database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        await DbInitializer.InitializeAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Global Exception Handler
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Static Files & SPA Support
app.UseDefaultFiles();
app.UseStaticFiles();

// Serve outside-wwwroot Uploads folder (ContentRootPath/uploads)
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment() || true) // Enable Swagger for easy API testing
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Construction Project Management API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SPA Fallback: Any non-API / non-Upload route returns index.html for React Router
app.MapFallback(async context =>
{
    if (context.Request.Path.StartsWithSegments("/api") || context.Request.Path.StartsWithSegments("/uploads"))
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsJsonAsync(new { success = false, message = "Resource not found." });
        return;
    }

    var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    var indexPath = Path.Combine(webRoot, "index.html");
    if (File.Exists(indexPath))
    {
        context.Response.ContentType = "text/html; charset=utf-8";
        await context.Response.SendFileAsync(indexPath);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsync("Frontend index.html not found in wwwroot. Please run the build script first.");
    }
});

app.Run();

using ConstructionManagement.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace ConstructionManagement.Infrastructure.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<FileStorageService> _logger;
    private const string UploadsFolder = "uploads";

    public FileStorageService(IWebHostEnvironment environment, ILogger<FileStorageService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<StoredFileResult> SaveFileAsync(
        IFormFile file,
        string subFolder,
        string[]? allowedExtensions = null,
        long maxSizeBytes = 25 * 1024 * 1024)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("Tệp tin tải lên không hợp lệ hoặc rỗng.");
        }

        if (file.Length > maxSizeBytes)
        {
            var maxMb = maxSizeBytes / (1024 * 1024);
            throw new InvalidOperationException($"Dung lượng tệp vượt quá giới hạn cho phép ({maxMb}MB).");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (allowedExtensions != null && allowedExtensions.Length > 0)
        {
            var normalizedExt = extension.TrimStart('.');
            var isAllowed = allowedExtensions.Any(ext => 
                ext.TrimStart('.').Equals(normalizedExt, StringComparison.OrdinalIgnoreCase) ||
                (normalizedExt == "jfif" && (ext.Contains("jpg", StringComparison.OrdinalIgnoreCase) || ext.Contains("jpeg", StringComparison.OrdinalIgnoreCase)))
            );
            if (!isAllowed)
            {
                throw new InvalidOperationException($"Định dạng tệp '{extension}' không được hỗ trợ.");
            }
        }

        // Thư mục uploads nằm ở ContentRootPath/uploads (ngang cấp với wwwroot)
        var uploadsRoot = Path.Combine(_environment.ContentRootPath, UploadsFolder);
        var targetDir = string.IsNullOrWhiteSpace(subFolder)
            ? uploadsRoot
            : Path.Combine(uploadsRoot, subFolder);

        if (!Directory.Exists(targetDir))
        {
            Directory.CreateDirectory(targetDir);
        }

        // Tạo tên file duy nhất tránh xung đột
        var safeOriginalName = Path.GetFileNameWithoutExtension(file.FileName);
        // Rút gọn tên gốc nếu quá dài
        if (safeOriginalName.Length > 50) safeOriginalName = safeOriginalName.Substring(0, 50);
        var uniqueFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}_{safeOriginalName}{extension}";
        var fullPath = Path.Combine(targetDir, uniqueFileName);

        using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var normalizedSubFolder = string.IsNullOrWhiteSpace(subFolder) ? "" : subFolder.Replace("\\", "/").Trim('/');
        var relativeUrl = string.IsNullOrWhiteSpace(normalizedSubFolder)
            ? $"/uploads/{uniqueFileName}"
            : $"/uploads/{normalizedSubFolder}/{uniqueFileName}";

        return new StoredFileResult
        {
            FileName = file.FileName,
            FilePath = relativeUrl,
            FileSize = file.Length,
            ContentType = file.ContentType
        };
    }

    public async Task<List<StoredFileResult>> SaveMultipleFilesAsync(
        IEnumerable<IFormFile> files,
        string subFolder,
        string[]? allowedExtensions = null,
        long maxSizeBytes = 25 * 1024 * 1024)
    {
        var results = new List<StoredFileResult>();
        foreach (var file in files)
        {
            if (file != null && file.Length > 0)
            {
                var stored = await SaveFileAsync(file, subFolder, allowedExtensions, maxSizeBytes);
                results.Add(stored);
            }
        }
        return results;
    }

    public void DeleteFile(string? relativeFilePath)
    {
        if (string.IsNullOrWhiteSpace(relativeFilePath)) return;

        try
        {
            var cleanedPath = relativeFilePath.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString());
            var fullPath = Path.Combine(_environment.ContentRootPath, cleanedPath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Không thể xóa file {FilePath}", relativeFilePath);
        }
    }
}

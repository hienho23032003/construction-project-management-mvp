using Microsoft.AspNetCore.Http;

namespace ConstructionManagement.Application.Interfaces;

public class StoredFileResult
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty; // Relative URL e.g. /uploads/discussions/xyz.jpg
    public long FileSize { get; set; }
    public string? ContentType { get; set; }
}

public interface IFileStorageService
{
    Task<StoredFileResult> SaveFileAsync(
        IFormFile file,
        string subFolder,
        string[]? allowedExtensions = null,
        long maxSizeBytes = 25 * 1024 * 1024);

    Task<List<StoredFileResult>> SaveMultipleFilesAsync(
        IEnumerable<IFormFile> files,
        string subFolder,
        string[]? allowedExtensions = null,
        long maxSizeBytes = 25 * 1024 * 1024);

    void DeleteFile(string? relativeFilePath);
}

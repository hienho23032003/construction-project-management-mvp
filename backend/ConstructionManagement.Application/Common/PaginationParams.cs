namespace ConstructionManagement.Application.Common;

public class PaginationParams
{
    private const int MaxPageSize = 100;
    private int _pageSize = 20;

    public int PageIndex { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 20 : value);
    }

    public string? Search { get; set; }
    public string? Role { get; set; }
    public string? SortBy { get; set; }
    public bool IsDescending { get; set; } = false;
}

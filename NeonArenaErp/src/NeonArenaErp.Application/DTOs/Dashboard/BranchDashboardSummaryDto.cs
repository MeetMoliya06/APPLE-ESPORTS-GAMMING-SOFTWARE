using System;

namespace NeonArenaErp.Application.DTOs.Dashboard;

public class BranchDashboardSummaryDto
{
    public Guid BranchId { get; set; }
    public string BranchName { get; set; } = null!;
    public int TotalPcs { get; set; }
    public int ActivePcs { get; set; }
    public int IdlePcs { get; set; }
    public string ActiveOperator { get; set; } = "None";
    public decimal TotalSales { get; set; }
    public decimal GamingSales { get; set; }
    public decimal FoodSales { get; set; }
    public decimal CashInDrawer { get; set; }
}

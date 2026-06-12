using Microsoft.AspNetCore.Mvc;

namespace NeonArenaErp.Api.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Check()
    {
        var diagnostics = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            MachineName = Environment.MachineName,
            ProcessId = Environment.ProcessId,
            Version = "v2.0"
        };
        
        return Ok(diagnostics);
    }
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin();
    });
});

var app = builder.Build();

app.UseCors("frontend");

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/waitlist", (WaitlistRequest request) =>
{
    // TODO: Persist submissions to a database or email platform.
    // TODO: Validate duplicate signups and integrate the future Stripe launch flow.
    return Results.Accepted(value: new
    {
        message = "Waitlist capture placeholder received.",
        request.Email,
        request.FirstName,
        request.Audience
    });
});

app.Run();

public sealed record WaitlistRequest(string? FirstName, string Email, string Audience);

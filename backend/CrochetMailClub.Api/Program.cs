using System.Collections.Concurrent;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["CORS_ALLOWED_ORIGINS"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod();

        if (string.IsNullOrWhiteSpace(allowedOrigins))
        {
            policy.AllowAnyOrigin();
            return;
        }

        policy.WithOrigins(
            allowedOrigins
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        );
    });
});

builder.Services.AddSingleton<WaitlistStore>();

var app = builder.Build();

app.UseCors("frontend");

app.MapGet("/", () => Results.Ok(new
{
    name = "Crochet Mail Club API",
    status = "ok"
}));

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapPost("/api/waitlist", (WaitlistRequest request, WaitlistStore store) =>
{
    var normalizedEmail = request.Email.Trim().ToLowerInvariant();
    var firstName = string.IsNullOrWhiteSpace(request.FirstName) ? null : request.FirstName.Trim();
    var audience = request.Audience.Trim();

    if (string.IsNullOrWhiteSpace(normalizedEmail) || !EmailPattern().IsMatch(normalizedEmail))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["email"] = ["Please provide a valid email address."]
        });
    }

    if (!WaitlistAudience.All.Contains(audience))
    {
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["audience"] = [$"Audience must be one of: {string.Join(", ", WaitlistAudience.All)}."]
        });
    }

    var submission = new WaitlistSubmission(
        firstName,
        normalizedEmail,
        audience,
        DateTimeOffset.UtcNow
    );

    if (!store.TryAdd(submission))
    {
        return Results.Conflict(new
        {
            message = "That email is already on the waitlist."
        });
    }

    // TODO: Replace in-memory storage with a durable database or email platform.
    // TODO: Connect launch communications and Stripe subscription setup when plans go live.
    return Results.Accepted(value: new
    {
        message = "You’re on the list! We’ll send crochet goodness soon.",
        submission.Email,
        submission.FirstName,
        submission.Audience,
        submission.CreatedAt
    });
});

app.Run();

static partial class Program
{
    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    public static partial Regex EmailPattern();
}

public sealed record WaitlistRequest(string? FirstName, string Email, string Audience);

public sealed record WaitlistSubmission(
    string? FirstName,
    string Email,
    string Audience,
    DateTimeOffset CreatedAt
);

public sealed class WaitlistStore
{
    private readonly ConcurrentDictionary<string, WaitlistSubmission> _entries = new();

    public bool TryAdd(WaitlistSubmission submission)
    {
        return _entries.TryAdd(submission.Email, submission);
    }
}

public static class WaitlistAudience
{
    public static readonly HashSet<string> All = new(StringComparer.Ordinal)
    {
        "Me",
        "Gift",
        "Child or teen",
        "Not sure"
    };
}

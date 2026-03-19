using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using School_Management.API.Middlewares;
using School_Management.API.Mappings;
using School_Management.API.Services;
using School_Management.API.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Add auto mapper
builder.Services.AddAutoMapper(typeof(AutoMapperProfiles));

//Dependency Injection
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();

// Add logger into our project
var logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/School_Management.txt", rollingInterval: RollingInterval.Minute)
    .MinimumLevel.Debug()
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog(logger);

// Configure IdentityDbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("NeonConnectionString")));

// Configure identity services
builder.Services.AddIdentityCore<AppUser>()
    .AddRoles<IdentityRole<Guid>>()
    .AddTokenProvider<DataProtectorTokenProvider<AppUser>>("SchoolManager")
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// Configure JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).
    AddJwtBearer(options =>
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true, 
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    });

// Configure Identity options (password and lockout policy)
builder.Services.Configure<IdentityOptions>(options =>
{
    // Password policy
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 1;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;

    // Lockout policy
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(2);
    options.Lockout.AllowedForNewUsers = true;

});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var service = scope.ServiceProvider;
    var userManager = service.GetRequiredService<UserManager<AppUser>>();

    var adminUser = await userManager.FindByNameAsync("admin123");
    if(adminUser == null)
    {
        var user = new AppUser
        {
            UserName = "admin123",
            FullName = "Hoàng Quốc Tùng",
            Email = "TungKham123@gmail.com",
            EmailConfirmed = true,
            Address = "Xô Viết Nghệ Tĩnh, Bình Thạnh, Hồ Chí Minh",
            Birthday = new DateTime(2004, 1, 22),
            PhoneNumber = "0978654234"
        };

        var result = await userManager.CreateAsync(user, "Admin@12345");
        if (result.Succeeded)
        { 
            await userManager.AddToRoleAsync(user, "Admin");
            Console.WriteLine("=====>  ĐÃ TẠO ADMIN THÀNH CÔNG");
        }
        else
        {
            foreach(var error in result.Errors)
            {
                Console.WriteLine($"======> TẠO ADMIN THẤT BẠI {error.Description}");
            }
        } 
            
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlerMiddlewares>();

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

using Microsoft.AspNetCore.Identity;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;
using ApplicationException = School_Management.API.Exceptions.ApplicationException;

namespace School_Management.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> userManager;
        private readonly ITokenService tokenService;
        private readonly IAuthRepository authRepository;

        public AuthService(UserManager<AppUser> userManager, ITokenService tokenService, IAuthRepository authRepository)
        {
            this.userManager = userManager;
            this.tokenService = tokenService;
            this.authRepository = authRepository;
        }
        public async Task ChangePasswordAsync(ChangePasswordRequestDTO changePasswordRequest, string? UserId)
        {
            AppUser user = await userManager.FindByIdAsync(UserId);
            if (user == null) throw new NotFoundException("User is invalid!");

            var result = await userManager.ChangePasswordAsync(user, changePasswordRequest.OldPassword, changePasswordRequest.NewPassword);
            if(!result.Succeeded)
            {
                var error = result.Errors.FirstOrDefault();

                if (error?.Code == "PasswordMismatch")
                {
                    throw new BadRequestException("OldPassword is incorrect!");
                }

                throw new BadRequestException(error?.Description ?? "ChangePassword failed");
            }
        }

        public async Task<AuthResponse> LoginAsync(LoginRequestDTO loginRequest)
        {
            // Check username
            var user = await userManager.FindByNameAsync(loginRequest.UserName);
            if (user == null) throw new UnauthorizedException("Username or password is invalid!");

            // Check lock out
            if(await userManager.IsLockedOutAsync(user))
            {
                var lockoutEnd = await userManager.GetLockoutEndDateAsync(user);
                if(lockoutEnd.HasValue)
                {
                    if(lockoutEnd.Value.Year > 2090)
                    {
                        throw new ForbiddenException("Your account is locked out by admin!");
                    }

                    var time = lockoutEnd.Value - DateTimeOffset.UtcNow;
                    var secondLeft = Math.Ceiling(time.TotalSeconds);
                    throw new ForbiddenException($"Your password is wrong too many time! Please wait {secondLeft.ToString()} seconds to login again");
                }
            }

            // Check password
            if(!await userManager.CheckPasswordAsync(user, loginRequest.PassWord))
            {
                await userManager.AccessFailedAsync(user);
                throw new UnauthorizedException("Username or password is invalid!");
            }

            await userManager.ResetAccessFailedCountAsync(user);

            // Success login
            var roles = await userManager.GetRolesAsync(user);
            var accessToken = tokenService.GenerateAccessToken(user, roles);
            var refreshToken = tokenService.GenerateRefreshToken();

            //Revoke all old refreshToken
            await authRepository.RevokeAllUserToken(user.Id);
            
            //Insert new RToken into DB
            var RToken = new RefreshToken
            {
                UserId = user.Id,
                IsRevoked = false,
                TokenHash = refreshToken,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
            };

            // Call insert RToken method
            await authRepository.AddRefreshToken(RToken);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpireTime = DateTimeOffset.UtcNow.AddMinutes(15),
                Role = roles.FirstOrDefault(),
                FullName = user.FullName,
                Email = user.Email,
                UserId = user.Id
            };
        }

        public async Task LogoutAsync(RefreshTokenRequestDTO refreshTokenRequest)
        {
            var token = await authRepository.GetRefreshTokenByValue(refreshTokenRequest.RefreshToken);
            if (token != null)
            {
                token.IsRevoked = true;
                await authRepository.UpdateRefreshToken(token);
            }    

            
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequestDTO refreshTokenRequest)
        {
            // Check token exist
            var rToken = await authRepository.GetRefreshTokenByValue(refreshTokenRequest.RefreshToken);
            if (rToken == null) throw new UnauthorizedException("RefreshToken is invalid");

            // Check isRevoked
            if(rToken.IsRevoked)
            {
                await authRepository.RevokeAllUserToken(rToken.UserId);
                throw new ForbiddenException("RefreshToken is revoked! Please login again");
            }

            // Check expiretime
            if(rToken.ExpiresAt < DateTimeOffset.UtcNow)
            {
                throw new UnauthorizedException("RefreshToken is expired");
            }

            // Check user of this token
            var user = await userManager.FindByIdAsync(rToken.UserId.ToString());
            if (user == null) throw new UnauthorizedException("User is invalid");

            //Create new token
            var roles = await userManager.GetRolesAsync(user);
            var accessToken = tokenService.GenerateAccessToken(user, roles);
            var nRefreshToken = tokenService.GenerateRefreshToken();

            //Revoke old token
            rToken.IsRevoked = true;
            await authRepository.UpdateRefreshToken(rToken);

            //Insert new RToken into DB
            var RToken = new RefreshToken
            {
                UserId = user.Id,
                IsRevoked = false,
                TokenHash = nRefreshToken,
                ExpiresAt = DateTimeOffset.UtcNow.AddDays(7)
            };

            // Call insert RToken method
            await authRepository.AddRefreshToken(RToken);

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = nRefreshToken,
                AccessTokenExpireTime = DateTimeOffset.UtcNow.AddMinutes(15),
                Role = roles.FirstOrDefault(),
                FullName = user.FullName,
                Email = user.Email,
                UserId = user.Id
            };

        }
    }
}

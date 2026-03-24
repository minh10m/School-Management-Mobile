using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Exceptions;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using School_Management.API.Repositories;

namespace School_Management.API.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly ITeacherRepository teacherRepository;
        private readonly UserManager<AppUser> userManager;
        private readonly ApplicationDbContext context;

        public TeacherService(ITeacherRepository teacherRepository, UserManager<AppUser> userManager, ApplicationDbContext context)
        {
            this.teacherRepository = teacherRepository;
            this.userManager = userManager;
            this.context = context;
        }
        public async Task<PagedResponse<TeacherListResponse>> GetAllTeacher(string? filterOn, string? filterQuery, string? sortBy, bool isAscending, int pageNumber, int pageSize)
        {
            return await teacherRepository.GetAllTeacher(filterOn, filterQuery, sortBy, isAscending, pageNumber, pageSize);
        }

        public async Task<TeacherInfoResponse> GetMyProfileForTeacher(Guid userId)
        {
            var result = await teacherRepository.GetMyProfileForTeacher(userId);
            if (result == null) throw new NotFoundException("Teacher is invalid");
            return result;
        }

        public async Task<TeacherInfoResponse> GetTeacherById(Guid teacherId)
        {
            var result = await teacherRepository.GetTeacherById(teacherId);
            if (result == null) throw new NotFoundException("Teacher is invalid");
            return result;
        }

        public async Task<TeacherInfoResponse> UpdateMyProfileForTeacher(UpdateUserRequest updateUserRequest, Guid userId)
        {
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new NotFoundException("Teacher is invalid");

            if (updateUserRequest.Email != null)
            {
                var result = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!result.Succeeded) throw new BadRequestException("Update email failed");

            }

            user.FullName = updateUserRequest.FullName ?? user.FullName;
            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            if (updateUserRequest.Birthday != null)
            {
                DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date);
                user.Birthday = date.ToUniversalTime();
            }
            var resultF = await userManager.UpdateAsync(user);
            if (!resultF.Succeeded) throw new BadRequestException("Update failed");
            return await teacherRepository.ReturnData(user, await teacherRepository.GetTeacherIdByUserId(user.Id));
        }

        public async Task<TeacherInfoResponse> UpdateTeacherForAdmin(UpdateUserRequest updateUserRequest, Guid teacherId)
        {
            var userId = await teacherRepository.GetUserIdByTeacherid(teacherId);
            if (userId == Guid.Empty) throw new NotFoundException("Teacher is invalid");
            var user = await userManager.FindByIdAsync(userId.ToString());
            if (user == null) throw new NotFoundException("Teacher is invalid");

            if(updateUserRequest.Email != null)
            {
                var result = await userManager.SetEmailAsync(user, updateUserRequest.Email);
                if (!result.Succeeded) throw new BadRequestException("Update email failed");

            }

            user.FullName = updateUserRequest.FullName ?? user.FullName;
            user.PhoneNumber = updateUserRequest.PhoneNumber ?? user.PhoneNumber;
            user.Address = updateUserRequest.Address ?? user.Address;
            if(updateUserRequest.Birthday != null)
            {
                DateTimeOffset.TryParse(updateUserRequest.Birthday, out var date);
                user.Birthday = date.ToUniversalTime();
            }
            var resultF = await userManager.UpdateAsync(user);
            if (!resultF.Succeeded) throw new BadRequestException("Update failed");
            return await teacherRepository.ReturnData(user, teacherId);
        }
    }
}

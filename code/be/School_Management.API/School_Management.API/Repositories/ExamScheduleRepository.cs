using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;

namespace School_Management.API.Repositories
{
    public class ExamScheduleRepository : IExamScheduleRepository
    {
        private readonly ApplicationDbContext context;

        public ExamScheduleRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        public async Task<(ExamScheduleResponse? data, string? message)> CreateExamSchedule(ExamScheduleRequest request)
        {
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var examschedule = new ExamSchedule();
                if (request.IsActive)
                {
                    var activeTrueExamSCH = await context.ExamSchedule.Where(x => x.Type == request.Type && x.Term == request.Term
                                                                        && x.SchoolYear == request.SchoolYear && x.Grade == request.Grade
                                                                        && x.IsActive == true).FirstOrDefaultAsync();
                    if (activeTrueExamSCH != null)
                        activeTrueExamSCH.IsActive = false;
                }
                else
                {
                    var isExisted = await context.ExamSchedule.AnyAsync(x => x.Type == request.Type && x.Term == request.Term
                                                                        && x.SchoolYear == request.SchoolYear && x.Grade == request.Grade
                                                                        && x.IsActive == request.IsActive);
                    if (isExisted) return (null, "CONFLICT_TYPE");
                }


                examschedule = new ExamSchedule
                {
                    Id = Guid.NewGuid(),
                    SchoolYear = request.SchoolYear,
                    Grade = request.Grade,
                    IsActive = request.IsActive,
                    Term = request.Term,
                    Type = request.Type
                };

                context.ExamSchedule.Add(examschedule);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();
                return (new ExamScheduleResponse
                {
                    ExamScheduleId = examschedule.Id,
                    SchoolYear = examschedule.SchoolYear,
                    Grade = examschedule.Grade,
                    IsActive = examschedule.IsActive,
                    Term = examschedule.Term,
                    Type = examschedule.Type
                }, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
            
        }
    }
}

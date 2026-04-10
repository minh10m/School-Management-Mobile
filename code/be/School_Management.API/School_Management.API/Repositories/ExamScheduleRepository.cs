using ExcelDataReader;
using Microsoft.EntityFrameworkCore;
using School_Management.API.Data;
using School_Management.API.Models.Domain;
using School_Management.API.Models.DTO;
using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Repositories
{
    public class ExamScheduleRepository : IExamScheduleRepository
    {
        private readonly ApplicationDbContext context;

        public ExamScheduleRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public async Task<(bool result, string? message)> AssignStudentIntoExamScheduleDetail(Guid examScheduleId)
        {
            var examSchedule = await context.ExamSchedule.FirstOrDefaultAsync(x => x.Id == examScheduleId);
            if (examSchedule == null) return (false, "Không tìm thấy lịch thi");

            var studentIds = await context.StudentClassYear.AsNoTracking().Where(x => x.ClassYear.SchoolYear == examSchedule.SchoolYear
                                                                    && x.ClassYear.Grade == examSchedule.Grade)
                                                           .OrderBy(x => x.Student.User.FullName)
                                                           .Select(g => g.StudentId)
                                                           .ToListAsync();
            if (!studentIds.Any()) return (false, "Không tìm thấy danh sách học sinh của lịch thi này");

            var allDetails = await context.ExamScheduleDetail.Include(x => x.Subject).Where(x => x.ExamScheduleId == examScheduleId)
                                                                       .ToListAsync();

            var subjectGroups = allDetails.GroupBy(x => new { x.SubjectId, x.Subject.SubjectName });
            var assignments = new List<ExamStudentAssignment>();
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var detailIds = allDetails.Select(d => d.Id).ToList();
                var oldRecords = context.ExamStudentAssignment.Where(a => detailIds.Contains(a.ExamScheduleDetailId));
                context.ExamStudentAssignment.RemoveRange(oldRecords);

                foreach (var group in subjectGroups)
                {
                    var subjectName = group.Key.SubjectName;

                    var roomGroups = group.ToList();
                    var totalCapicity = roomGroups.Count * 30;
                    if (totalCapicity < studentIds.Count) return (false, $"Môn {subjectName} không đủ chỗ, tổng học sinh là {studentIds.Count} học sinh và số chỗ hiện tại là {totalCapicity}");

                    var studentIdx = 0;
                    var idNumberCounter = 1;

                    foreach(var room in roomGroups)
                    {
                        var studentsInRoom = studentIds.Skip(studentIdx)
                                                       .Take(30)
                                                       .ToList();
                        if (!studentsInRoom.Any()) break;
                        foreach(var studentId in studentsInRoom)
                        {
                            assignments.Add(new ExamStudentAssignment
                            {
                                Id = Guid.NewGuid(),
                                StudentId = studentId,
                                ExamScheduleDetailId = room.Id,
                                IdentificationNumber = $"SBD{idNumberCounter:D4}"
                            });
                            idNumberCounter++;
                        }
                        studentIdx += 30;

                    }
                }

                context.ExamStudentAssignment.AddRange(assignments);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (true, "Thêm dữ liệu thành công");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
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

        public async Task<(bool result, string? message)> CreateExamScheduleDetail(IFormFile file, Guid examScheduleId)
        {
            var rows = ReadExcelData(file);
            if (!rows.Any()) return (false, "File trống không có dữ liệu");

            var teacherDict = await context.Teacher.Include(x => x.User).ToDictionaryAsync(x => x.User.Email, x => x.Id);
            var subjectDict = await context.Subject.ToDictionaryAsync(x => x.SubjectName, x => x.Id);

            var dateFile = rows.Select(x => x.Date).Distinct().ToList();
            var existingData = await context.ExamScheduleDetail.AsNoTracking().Where(x => dateFile.Contains(x.Date))
                                                               .Select(g => new { g.StartTime, g.FinishTime, g.Date, g.RoomName, g.TeacherId })
                                                               .ToListAsync();
            var overallResult = new List<ExamScheduleDetail>();
            var currentRow = 2;
            using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                foreach (var row in rows)
                {
                    var validationContext = new ValidationContext(row);
                    var result = new List<ValidationResult>();

                    if (!Validator.TryValidateObject(row, validationContext, result, true))
                        return (false, $"Dòng {currentRow} : {result.First().ErrorMessage}");

                    if (!teacherDict.TryGetValue(row.TeacherEmail, out var tId))
                        return (false, $"Dòng {currentRow} : Giá trị {row.TeacherEmail} không tồn tại");

                    if (!subjectDict.TryGetValue(row.SubjectName, out var sId))
                        return (false, $"Dòng {currentRow} : Giá trị {row.SubjectName} không tồn tại");

                    var isExisted = existingData.Any(x => x.Date == row.Date
                                                       && (x.StartTime < row.FinishTime && x.FinishTime > row.StartTime)
                                                       && (x.TeacherId == tId || x.RoomName == row.RoomName))
                                    ||
                                    overallResult.Any(x => x.Date == row.Date
                                                       && (x.StartTime < row.FinishTime && x.FinishTime > row.StartTime)
                                                       && (x.TeacherId == tId || x.RoomName == row.RoomName));
                    if (isExisted) return (false, $"Dòng {currentRow} : Lỗi trùng giáo viên hoặc phòng thi");
                    overallResult.Add(new ExamScheduleDetail
                    {
                        Id = Guid.NewGuid(),
                        ExamScheduleId = examScheduleId,
                        TeacherId = tId,
                        SubjectId = sId,
                        StartTime = row.StartTime,
                        FinishTime = row.FinishTime,
                        Date = row.Date,
                        RoomName = row.RoomName
                    });

                    currentRow++;

                }
                context.ExamScheduleDetail.AddRange(overallResult);
                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (true, "SUCCESS");
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
            

        }

        public List<ExamScheduleDetailRequest> ReadExcelData(IFormFile file)
        {
            var list = new List<ExamScheduleDetailRequest>();
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
            using (var stream = file.OpenReadStream())
            using(var reader = ExcelReaderFactory.CreateReader(stream))
            {
                var rowIndex = 0;
                while (reader.Read())
                {
                    rowIndex++;
                    if (rowIndex == 1) continue;

                    list.Add(new ExamScheduleDetailRequest
                    {
                        TeacherEmail = reader.GetValue(0)?.ToString()?.Trim() ?? "",
                        SubjectName = reader.GetValue(1)?.ToString()?.Trim() ?? "",
                        RoomName = reader.GetValue(2)?.ToString()?.Trim() ?? "",
                        StartTime = TimeSpan.Parse(reader.GetValue(3)?.ToString()?.Trim()),
                        FinishTime = TimeSpan.Parse(reader.GetValue(4)?.ToString()?.Trim()),
                        Date = DateOnly.FromDateTime(Convert.ToDateTime(reader.GetValue(5)))
                    });
                }

                return list;
            }
        }
    }
}

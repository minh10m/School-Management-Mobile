using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class CreateExamScheduleAndRelatedTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExamSchedule",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Term = table.Column<int>(type: "integer", nullable: false),
                    SchoolYear = table.Column<int>(type: "integer", nullable: false),
                    Grade = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamSchedule", x => x.Id);
                    table.CheckConstraint("CK_Grade_ExamSchedule", "\"Grade\" >= 10 AND \"Grade\" <= 12");
                    table.CheckConstraint("CK_SchoolYear_ExamSchedule", "\"SchoolYear\" > 2000 AND \"SchoolYear\" < 2100");
                    table.CheckConstraint("CK_Term_ExamSchedule", "\"Term\" >= 1 AND \"Term\" <= 2");
                });

            migrationBuilder.CreateTable(
                name: "ExamScheduleDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamScheduleId = table.Column<Guid>(type: "uuid", nullable: false),
                    TeacherId = table.Column<Guid>(type: "uuid", nullable: true),
                    SubjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    FinishTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    RoomName = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamScheduleDetail", x => x.Id);
                    table.CheckConstraint("CK_Time_ExamScheduleDetail", "\"FinishTime\" > \"StartTime\"");
                    table.ForeignKey(
                        name: "FK_ExamScheduleDetail_ExamSchedule_ExamScheduleId",
                        column: x => x.ExamScheduleId,
                        principalTable: "ExamSchedule",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamScheduleDetail_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamScheduleDetail_Teacher_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Teacher",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ExamStudentAssignment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamScheduleDetailId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    IdentificationNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExamStudentAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExamStudentAssignment_ExamScheduleDetail_ExamScheduleDetail~",
                        column: x => x.ExamScheduleDetailId,
                        principalTable: "ExamScheduleDetail",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExamStudentAssignment_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear_IsActive",
                table: "ExamSchedule",
                columns: new[] { "Type", "Term", "Grade", "SchoolYear", "IsActive" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamScheduleDetail_ExamScheduleId",
                table: "ExamScheduleDetail",
                column: "ExamScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamScheduleDetail_SubjectId",
                table: "ExamScheduleDetail",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamScheduleDetail_TeacherId",
                table: "ExamScheduleDetail",
                column: "TeacherId");

            migrationBuilder.CreateIndex(
                name: "IX_ExamStudentAssignment_ExamScheduleDetailId_StudentId",
                table: "ExamStudentAssignment",
                columns: new[] { "ExamScheduleDetailId", "StudentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExamStudentAssignment_StudentId",
                table: "ExamStudentAssignment",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExamStudentAssignment");

            migrationBuilder.DropTable(
                name: "ExamScheduleDetail");

            migrationBuilder.DropTable(
                name: "ExamSchedule");
        }
    }
}

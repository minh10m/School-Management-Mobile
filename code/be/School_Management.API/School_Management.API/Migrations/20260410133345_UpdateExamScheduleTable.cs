using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExamScheduleTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear_IsActive",
                table: "ExamSchedule");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear",
                table: "ExamSchedule",
                columns: new[] { "Type", "Term", "Grade", "SchoolYear" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear",
                table: "ExamSchedule");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear_IsActive",
                table: "ExamSchedule",
                columns: new[] { "Type", "Term", "Grade", "SchoolYear", "IsActive" },
                unique: true);
        }
    }
}

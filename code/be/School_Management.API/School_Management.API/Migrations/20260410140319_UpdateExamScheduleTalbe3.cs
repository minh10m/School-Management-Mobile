using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExamScheduleTalbe3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear",
                table: "ExamSchedule");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "ExamSchedule",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSchedule_Title_Type_Term_Grade_SchoolYear",
                table: "ExamSchedule",
                columns: new[] { "Title", "Type", "Term", "Grade", "SchoolYear" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ExamSchedule_Title_Type_Term_Grade_SchoolYear",
                table: "ExamSchedule");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "ExamSchedule");

            migrationBuilder.CreateIndex(
                name: "IX_ExamSchedule_Type_Term_Grade_SchoolYear",
                table: "ExamSchedule",
                columns: new[] { "Type", "Term", "Grade", "SchoolYear" },
                unique: true);
        }
    }
}

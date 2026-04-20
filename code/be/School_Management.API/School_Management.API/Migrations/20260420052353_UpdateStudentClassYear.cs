using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStudentClassYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentClassYear_StudentId",
                table: "StudentClassYear");

            migrationBuilder.AddColumn<int>(
                name: "SchoolYear",
                table: "StudentClassYear",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassYear_StudentId_SchoolYear",
                table: "StudentClassYear",
                columns: new[] { "StudentId", "SchoolYear" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StudentClassYear_StudentId_SchoolYear",
                table: "StudentClassYear");

            migrationBuilder.DropColumn(
                name: "SchoolYear",
                table: "StudentClassYear");

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassYear_StudentId",
                table: "StudentClassYear",
                column: "StudentId");
        }
    }
}

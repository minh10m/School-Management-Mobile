using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class Update_Course_Assignment_Table1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "fileUrl",
                table: "LessonAssignment",
                newName: "FileUrl");

            migrationBuilder.RenameColumn(
                name: "Body",
                table: "LessonAssignment",
                newName: "FileTitle");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FileUrl",
                table: "LessonAssignment",
                newName: "fileUrl");

            migrationBuilder.RenameColumn(
                name: "FileTitle",
                table: "LessonAssignment",
                newName: "Body");
        }
    }
}

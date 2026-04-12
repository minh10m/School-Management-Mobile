using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLessonTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Lesson_CourseId_OrderIndex",
                table: "Lesson");

            migrationBuilder.CreateIndex(
                name: "IX_Lesson_CourseId",
                table: "Lesson",
                column: "CourseId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_OrderIndex_Lesson",
                table: "Lesson",
                sql: "\"OrderIndex\" > 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Lesson_CourseId",
                table: "Lesson");

            migrationBuilder.DropCheckConstraint(
                name: "CK_OrderIndex_Lesson",
                table: "Lesson");

            migrationBuilder.CreateIndex(
                name: "IX_Lesson_CourseId_OrderIndex",
                table: "Lesson",
                columns: new[] { "CourseId", "OrderIndex" },
                unique: true);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScheduleTable1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Schedule_ClassYearId_Term_SchoolYear",
                table: "Schedule");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_ClassYearId_Term_SchoolYear_Name",
                table: "Schedule",
                columns: new[] { "ClassYearId", "Term", "SchoolYear", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Schedule_ClassYearId_Term_SchoolYear_Name",
                table: "Schedule");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_ClassYearId_Term_SchoolYear",
                table: "Schedule",
                columns: new[] { "ClassYearId", "Term", "SchoolYear" },
                unique: true);
        }
    }
}

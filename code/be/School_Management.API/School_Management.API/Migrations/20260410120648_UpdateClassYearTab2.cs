using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClassYearTab2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ClassYear_HomeRoomId",
                table: "ClassYear");

            migrationBuilder.CreateIndex(
                name: "IX_ClassYear_HomeRoomId",
                table: "ClassYear",
                column: "HomeRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassYear_SchoolYear_HomeRoomId",
                table: "ClassYear",
                columns: new[] { "SchoolYear", "HomeRoomId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ClassYear_HomeRoomId",
                table: "ClassYear");

            migrationBuilder.DropIndex(
                name: "IX_ClassYear_SchoolYear_HomeRoomId",
                table: "ClassYear");

            migrationBuilder.CreateIndex(
                name: "IX_ClassYear_HomeRoomId",
                table: "ClassYear",
                column: "HomeRoomId",
                unique: true);
        }
    }
}

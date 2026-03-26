using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateScheduleTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ClassYear");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Schedule",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Schedule");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ClassYear",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}

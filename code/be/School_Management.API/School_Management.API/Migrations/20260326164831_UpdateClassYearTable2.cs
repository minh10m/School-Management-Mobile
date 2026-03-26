using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateClassYearTable2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ClassYear",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ClassYear");
        }
    }
}

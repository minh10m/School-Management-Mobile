using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedingRoleintoDB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("88ad671c-a2bc-4d35-85c6-02f42bfb3a0c"), "88ad671c-a2bc-4d35-85c6-02f42bfb3a0c", "Student", "STUDENT" },
                    { new Guid("ddfd9f1c-e824-4dd3-9859-5e12d419145f"), "ddfd9f1c-e824-4dd3-9859-5e12d419145f", "Teacher", "TEACHER" },
                    { new Guid("ef18be90-de43-45db-9c63-8778ff21e786"), "ef18be90-de43-45db-9c63-8778ff21e786", "Admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("88ad671c-a2bc-4d35-85c6-02f42bfb3a0c"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("ddfd9f1c-e824-4dd3-9859-5e12d419145f"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("ef18be90-de43-45db-9c63-8778ff21e786"));
        }
    }
}

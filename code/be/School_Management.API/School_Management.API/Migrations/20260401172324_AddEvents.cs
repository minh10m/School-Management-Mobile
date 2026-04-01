using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Schedule_ClassYearId_Term_SchoolYear_Name",
                table: "Schedule");

            migrationBuilder.CreateTable(
                name: "Events",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    FinishTime = table.Column<TimeSpan>(type: "interval", nullable: false),
                    EventDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SchoolYear = table.Column<int>(type: "integer", nullable: false),
                    Term = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Events", x => x.Id);
                    table.CheckConstraint("CK_SchoolYear", " \"SchoolYear\" >= 2000 AND \"SchoolYear\" <= 2100");
                    table.CheckConstraint("CK_StartTime_FinishTime", " \"StartTime\" < \"FinishTime\"");
                    table.CheckConstraint("CK_Term", " \"Term\" >= 1 AND \"Term\" <= 2");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_ClassYearId",
                table: "Schedule",
                column: "ClassYearId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_SchoolYear_Term_Name_ClassYearId",
                table: "Schedule",
                columns: new[] { "SchoolYear", "Term", "Name", "ClassYearId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Events_SchoolYear_Term_StartTime_Title",
                table: "Events",
                columns: new[] { "SchoolYear", "Term", "StartTime", "Title" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Events");

            migrationBuilder.DropIndex(
                name: "IX_Schedule_ClassYearId",
                table: "Schedule");

            migrationBuilder.DropIndex(
                name: "IX_Schedule_SchoolYear_Term_Name_ClassYearId",
                table: "Schedule");

            migrationBuilder.CreateIndex(
                name: "IX_Schedule_ClassYearId_Term_SchoolYear_Name",
                table: "Schedule",
                columns: new[] { "ClassYearId", "Term", "SchoolYear", "Name" },
                unique: true);
        }
    }
}

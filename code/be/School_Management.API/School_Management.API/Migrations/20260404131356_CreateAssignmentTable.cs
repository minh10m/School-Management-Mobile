using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class CreateAssignmentTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Assignment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(400)", maxLength: 400, nullable: false),
                    FileUrl = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    FileTitle = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    StartTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    FinishTime = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TeacherSubjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClassYearId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignment", x => x.Id);
                    table.CheckConstraint("CK_Time_Assignment", "\"StartTime\" < \"FinishTime\"");
                    table.ForeignKey(
                        name: "FK_Assignment_ClassYear_ClassYearId",
                        column: x => x.ClassYearId,
                        principalTable: "ClassYear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Assignment_TeacherSubject_TeacherSubjectId",
                        column: x => x.TeacherSubjectId,
                        principalTable: "TeacherSubject",
                        principalColumn: "TeacherSubjectId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_ClassYearId",
                table: "Assignment",
                column: "ClassYearId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignment_TeacherSubjectId",
                table: "Assignment",
                column: "TeacherSubjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assignment");
        }
    }
}

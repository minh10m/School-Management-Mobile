using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTeacherStudentAndCreateClassYear : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Teacher_UserId",
                table: "Teacher");

            migrationBuilder.DropIndex(
                name: "IX_Student_UserId",
                table: "Student");

            migrationBuilder.CreateTable(
                name: "ClassYear",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Grade = table.Column<int>(type: "integer", nullable: false),
                    ClassName = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SchoolYear = table.Column<string>(type: "text", nullable: false),
                    HomeRoomId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassYear", x => x.Id);
                    table.CheckConstraint("CK_ClassYear_Grade", "\"Grade\" >= 10 AND \"Grade\" <= 12");
                    table.ForeignKey(
                        name: "FK_ClassYear_Teacher_HomeRoomId",
                        column: x => x.HomeRoomId,
                        principalTable: "Teacher",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StudentClassYear",
                columns: table => new
                {
                    StudentClassYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClassYearId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentClassYear", x => x.StudentClassYearId);
                    table.ForeignKey(
                        name: "FK_StudentClassYear_ClassYear_ClassYearId",
                        column: x => x.ClassYearId,
                        principalTable: "ClassYear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentClassYear_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Teacher_UserId",
                table: "Teacher",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Student_UserId",
                table: "Student",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassYear_HomeRoomId",
                table: "ClassYear",
                column: "HomeRoomId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_ClassYear_Name_Year",
                table: "ClassYear",
                columns: new[] { "SchoolYear", "ClassName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassYear_ClassYearId_StudentId",
                table: "StudentClassYear",
                columns: new[] { "ClassYearId", "StudentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StudentClassYear_StudentId",
                table: "StudentClassYear",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StudentClassYear");

            migrationBuilder.DropTable(
                name: "ClassYear");

            migrationBuilder.DropIndex(
                name: "IX_Teacher_UserId",
                table: "Teacher");

            migrationBuilder.DropIndex(
                name: "IX_Student_UserId",
                table: "Student");

            migrationBuilder.CreateIndex(
                name: "IX_Teacher_UserId",
                table: "Teacher",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Student_UserId",
                table: "Student",
                column: "UserId");
        }
    }
}

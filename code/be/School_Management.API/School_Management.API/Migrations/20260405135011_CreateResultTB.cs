using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class CreateResultTB : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Result",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(70)", maxLength: 70, nullable: false),
                    Value = table.Column<float>(type: "real", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    SubjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    Term = table.Column<int>(type: "integer", nullable: false),
                    Weight = table.Column<int>(type: "integer", nullable: false),
                    SchoolYear = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Result", x => x.Id);
                    table.CheckConstraint("CK_SchoolYear_Result", "\"SchoolYear\" > 2000 AND \"SchoolYear\" < 2100");
                    table.CheckConstraint("CK_Term_Result", "\"Term\" >= 1 AND \"Term\" <= 2");
                    table.CheckConstraint("CK_Value_Result", "\"Value\" >= 0 AND \"Value\" <= 10");
                    table.CheckConstraint("CK_Weight_Result", "\"Weight\" >= 1 AND \"Weight\" <= 3");
                    table.ForeignKey(
                        name: "FK_Result_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Result_Subject_SubjectId",
                        column: x => x.SubjectId,
                        principalTable: "Subject",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Result_StudentId_SubjectId_Type_Term_SchoolYear",
                table: "Result",
                columns: new[] { "StudentId", "SubjectId", "Type", "Term", "SchoolYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Result_SubjectId",
                table: "Result",
                column: "SubjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Result");
        }
    }
}

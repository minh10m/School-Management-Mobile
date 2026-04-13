using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class Create_Fee_And_FeeDetail_Table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Fee",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DueDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ClassYearId = table.Column<Guid>(type: "uuid", nullable: false),
                    SchoolYear = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fee", x => x.Id);
                    table.CheckConstraint("CK_Amount_Fee", "\"Amount\" > 0");
                    table.CheckConstraint("CK_SchoolYear_Fee", "\"SchoolYear\" > 2000");
                    table.ForeignKey(
                        name: "FK_Fee_ClassYear_ClassYearId",
                        column: x => x.ClassYearId,
                        principalTable: "ClassYear",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FeeDetail",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FeeId = table.Column<Guid>(type: "uuid", nullable: true),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    AmountDue = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    AmountPaid = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PaidAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeeDetail", x => x.Id);
                    table.CheckConstraint("CK_Amount_FeeDetail", "\"AmountPaid\" <= \"AmountDue\"");
                    table.CheckConstraint("CK_AmountDue_Positive", "\"AmountDue\" >= 0");
                    table.CheckConstraint("CK_AmountPaid_NotNegative", "\"AmountPaid\" >= 0");
                    table.ForeignKey(
                        name: "FK_FeeDetail_Fee_FeeId",
                        column: x => x.FeeId,
                        principalTable: "Fee",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FeeDetail_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Fee_ClassYearId_SchoolYear_Title",
                table: "Fee",
                columns: new[] { "ClassYearId", "SchoolYear", "Title" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FeeDetail_FeeId",
                table: "FeeDetail",
                column: "FeeId");

            migrationBuilder.CreateIndex(
                name: "IX_FeeDetail_StudentId",
                table: "FeeDetail",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeeDetail");

            migrationBuilder.DropTable(
                name: "Fee");
        }
    }
}

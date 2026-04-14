using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFeeDetail3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail");

            migrationBuilder.AlterColumn<Guid>(
                name: "FeeId",
                table: "FeeDetail",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail",
                column: "FeeId",
                principalTable: "Fee",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail");

            migrationBuilder.AlterColumn<Guid>(
                name: "FeeId",
                table: "FeeDetail",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail",
                column: "FeeId",
                principalTable: "Fee",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

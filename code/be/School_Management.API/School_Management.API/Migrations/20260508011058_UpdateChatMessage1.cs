using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChatMessage1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversation_Message_LastMessageId",
                table: "Conversation");

            migrationBuilder.DropIndex(
                name: "IX_Conversation_LastMessageId",
                table: "Conversation");

            migrationBuilder.DropColumn(
                name: "LastMessageId",
                table: "Conversation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "LastMessageId",
                table: "Conversation",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversation_LastMessageId",
                table: "Conversation",
                column: "LastMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversation_Message_LastMessageId",
                table: "Conversation",
                column: "LastMessageId",
                principalTable: "Message",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}

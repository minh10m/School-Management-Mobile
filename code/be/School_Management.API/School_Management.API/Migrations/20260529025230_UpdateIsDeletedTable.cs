using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIsDeletedTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "UserConversation");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Submission");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ScheduleDetail");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Schedule");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Result");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RefreshTokens");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Payment");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "LessonVideo");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "LessonAssignment");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Lesson");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "FeeDetail");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Fee");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ExamStudentAssignment");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ExamScheduleDetail");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ExamSchedule");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Events");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "EnrollCourse");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Conversation");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Attendance");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AIChatHistory");

            migrationBuilder.AddForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail",
                column: "FeeId",
                principalTable: "Fee",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "UserConversation",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Submission",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ScheduleDetail",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Schedule",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Result",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RefreshTokens",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Payment",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Notification",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "LessonVideo",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "LessonAssignment",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Lesson",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "FeeDetail",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Fee",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ExamStudentAssignment",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ExamScheduleDetail",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ExamSchedule",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Events",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "EnrollCourse",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Conversation",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Attendance",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AIChatHistory",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_FeeDetail_Fee_FeeId",
                table: "FeeDetail",
                column: "FeeId",
                principalTable: "Fee",
                principalColumn: "Id");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymApi.Migrations
{
    /// <inheritdoc />
    public partial class GoalDeleteSetNull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyGoalLogs_Goals_GoalId",
                table: "DailyGoalLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyGoalLogs_Goals_GoalId",
                table: "DailyGoalLogs",
                column: "GoalId",
                principalTable: "Goals",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyGoalLogs_Goals_GoalId",
                table: "DailyGoalLogs");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyGoalLogs_Goals_GoalId",
                table: "DailyGoalLogs",
                column: "GoalId",
                principalTable: "Goals",
                principalColumn: "Id");
        }
    }
}

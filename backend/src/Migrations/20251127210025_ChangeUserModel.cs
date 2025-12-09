using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Balances_UserId",
                table: "Balances");

            migrationBuilder.CreateIndex(
                name: "IX_Balances_UserId",
                table: "Balances",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Balances_UserId",
                table: "Balances");

            migrationBuilder.CreateIndex(
                name: "IX_Balances_UserId",
                table: "Balances",
                column: "UserId");
        }
    }
}

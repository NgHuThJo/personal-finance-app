using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class CreateCompositeFkFromPotUserIdAndName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pots_Name_ThemeColor",
                table: "Pots");

            migrationBuilder.DropIndex(
                name: "IX_Pots_UserId",
                table: "Pots");

            migrationBuilder.DropIndex(
                name: "IX_Budgets_ThemeColor",
                table: "Budgets");

            migrationBuilder.CreateIndex(
                name: "IX_Pots_UserId_Name",
                table: "Pots",
                columns: new[] { "UserId", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pots_UserId_Name",
                table: "Pots");

            migrationBuilder.CreateIndex(
                name: "IX_Pots_Name_ThemeColor",
                table: "Pots",
                columns: new[] { "Name", "ThemeColor" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pots_UserId",
                table: "Pots",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_ThemeColor",
                table: "Budgets",
                column: "ThemeColor",
                unique: true);
        }
    }
}

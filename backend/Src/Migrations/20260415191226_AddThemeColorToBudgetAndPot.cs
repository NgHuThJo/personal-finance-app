using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddThemeColorToBudgetAndPot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pots_Name",
                table: "Pots");

            migrationBuilder.AddColumn<int>(
                name: "ThemeColor",
                table: "Pots",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ThemeColor",
                table: "Budgets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Pots_Name_ThemeColor",
                table: "Pots",
                columns: new[] { "Name", "ThemeColor" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_ThemeColor",
                table: "Budgets",
                column: "ThemeColor",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Pots_Name_ThemeColor",
                table: "Pots");

            migrationBuilder.DropIndex(
                name: "IX_Budgets_ThemeColor",
                table: "Budgets");

            migrationBuilder.DropColumn(
                name: "ThemeColor",
                table: "Pots");

            migrationBuilder.DropColumn(
                name: "ThemeColor",
                table: "Budgets");

            migrationBuilder.CreateIndex(
                name: "IX_Pots_Name",
                table: "Pots",
                column: "Name",
                unique: true);
        }
    }
}

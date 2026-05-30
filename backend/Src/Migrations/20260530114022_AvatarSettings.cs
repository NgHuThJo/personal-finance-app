using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AvatarSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AvatarUrl",
                table: "Users",
                newName: "AvatarSeed");

            migrationBuilder.AddColumn<int>(
                name: "AvatarStyle",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvatarStyle",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "AvatarSeed",
                table: "Users",
                newName: "AvatarUrl");
        }
    }
}

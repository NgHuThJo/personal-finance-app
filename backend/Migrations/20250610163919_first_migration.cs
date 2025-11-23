using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class first_migration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Boards",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boards", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "BoardColumns",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Name = table.Column<string>(type: "text", nullable: false),
                    BoardId = table.Column<int>(
                        type: "integer",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BoardColumns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BoardColumns_Boards_BoardId",
                        column: x => x.BoardId,
                        principalTable: "Boards",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "KanbanTasks",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(
                        type: "text",
                        nullable: false
                    ),
                    BoardColumnId = table.Column<int>(
                        type: "integer",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KanbanTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KanbanTasks_BoardColumns_BoardColumnId",
                        column: x => x.BoardColumnId,
                        principalTable: "BoardColumns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "SubTasks",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Description = table.Column<string>(
                        type: "text",
                        nullable: false
                    ),
                    IsCompleted = table.Column<bool>(
                        type: "boolean",
                        nullable: false
                    ),
                    KanbanTaskId = table.Column<int>(
                        type: "integer",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SubTasks_KanbanTasks_KanbanTaskId",
                        column: x => x.KanbanTaskId,
                        principalTable: "KanbanTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_BoardColumns_BoardId_Name",
                table: "BoardColumns",
                columns: new[] { "BoardId", "Name" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_KanbanTasks_BoardColumnId",
                table: "KanbanTasks",
                column: "BoardColumnId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SubTasks_KanbanTaskId",
                table: "SubTasks",
                column: "KanbanTaskId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "SubTasks");

            migrationBuilder.DropTable(name: "KanbanTasks");

            migrationBuilder.DropTable(name: "BoardColumns");

            migrationBuilder.DropTable(name: "Boards");
        }
    }
}

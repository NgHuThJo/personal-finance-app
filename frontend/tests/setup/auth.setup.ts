import path from "path";
import { fileURLToPath } from "url";
import { test } from "../fixtures/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, "./user.json");

test("authenticate", async ({ context }) => {
  await context.addCookies([
    {
      name: "refresh_token",
      value: "some-random-string",
      url: "https://localhost:5173",
      httpOnly: true,
    },
  ]);

  await context.storageState({
    path: authFile,
  });
});

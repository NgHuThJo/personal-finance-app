import { createFileRoute, redirect } from "@tanstack/react-router";
import { getLocalStorageItem } from "#frontend/shared/utils/localstorage";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const token = getLocalStorageItem("jwt");

    if (!token) {
      throw redirect({
        to: "/login",
        replace: true,
      });
    } else {
      throw redirect({
        to: "/dashboard",
        replace: true,
      });
    }
  },
  component: Index,
});

function Index() {
  return <div>Redirect to login.</div>;
}

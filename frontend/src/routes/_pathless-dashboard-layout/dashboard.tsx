import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import styles from "./dashboard.module.css";
import { Logout } from "#frontend/assets/icons/icons";
import { AccountSummary } from "#frontend/features/dashboard/components/account-summary";
import { BalanceSummary } from "#frontend/features/dashboard/components/balance-summary";
import { Logger } from "#frontend/shared/app/logging";
import { postApiAuthLogoutMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/_pathless-dashboard-layout/dashboard")({
  component: Index,
});

function Index() {
  const router = useRouter();
  const logout = accessTokenStore.getState().logout;
  const { mutate } = useMutation({
    ...postApiAuthLogoutMutation({
      credentials: "include",
    }),
    onSuccess: () => {
      Logger.debug("User successfully logged out");
    },
    onError: (error) => {
      Logger.error("Error while trying to log out user", error);
    },
    onSettled: () => {
      Logger.debug("User logout settled");
      logout();
      router.invalidate();
    },
  });

  const onClickLogout = () => {
    Logger.debug("User logs out");
    mutate({});
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Overview</h1>
        <Button variant="logout" onClick={onClickLogout}>
          <Logout />
          Logout
        </Button>
      </header>
      <BalanceSummary />
      <AccountSummary />
    </div>
  );
}

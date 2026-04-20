import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Suspense } from "react";
import styles from "./dashboard.module.css";
import { Logout } from "#frontend/assets/icons/icons";
import { AccountSummary } from "#frontend/features/dashboard/components/account-summary";
import { BalanceSummary } from "#frontend/features/dashboard/components/balance-summary";
import { Logger } from "#frontend/shared/app/logging";
import {
  createRefreshTokenQueryKey,
  logoutUserMutation,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";
import { Skeleton } from "#frontend/shared/primitives/skeleton";

export const Route = createFileRoute("/_pathless-dashboard-layout/dashboard")({
  component: Index,
});

function Index() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    ...logoutUserMutation({
      credentials: "include",
    }),
    onSuccess: () => {
      Logger.info("User successfully logged out");
    },
    onError: (error) => {
      Logger.error("Error while trying to log out user", error);
    },
    onSettled: () => {
      Logger.info("User logout settled");
      queryClient.removeQueries({
        queryKey: createRefreshTokenQueryKey(),
      });

      router.invalidate();
    },
  });

  const onClickLogout = () => {
    mutate({});
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Overview</h1>
        <Button variant="cta-primary" onClick={onClickLogout}>
          <Logout />
          Logout
        </Button>
      </header>
      <div>
        <Suspense fallback={<Skeleton height={100} />}>
          <BalanceSummary />
        </Suspense>
      </div>
      <div>
        <Suspense fallback={<Skeleton />}>
          <AccountSummary />
        </Suspense>
      </div>
    </div>
  );
}

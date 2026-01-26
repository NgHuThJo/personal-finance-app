import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getApiAuthRefreshOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const setAccessToken = accessTokenStore.getState().setAcessToken;
  const navigate = useNavigate();
  const { data } = useQuery({
    ...getApiAuthRefreshOptions({
      client: clientWithAuth,
    }),
  });

  useEffect(() => {
    if (data?.accessToken) {
      setAccessToken(data?.accessToken);

      navigate({
        to: "/dashboard",
      });
    }

    navigate({
      to: "/login",
    });
  }, [data, navigate, setAccessToken]);

  return <div>Redirect to login.</div>;
}

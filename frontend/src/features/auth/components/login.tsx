import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import styles from "./login.module.css";
import { IconEye } from "#frontend/assets/icons/icons";
import { Logger } from "#frontend/shared/app/logging";
import type { LoginUserRequest } from "#frontend/shared/client";
import { loginUserMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
import { useToggle } from "#frontend/shared/hooks/use-toggle";
import { Button } from "#frontend/shared/primitives/button";
import { accessTokenStore } from "#frontend/shared/store/access-token";

const getPageSizes = () => {
  return {
    screenX: window.screenX,
    screenY: window.screenY,
    browserWindowX: window.outerWidth,
    browserWindowY: window.outerHeight,
    popupWidth: 500,
    popupHeight: 500,
  };
};

const listeners = new Set<() => void>();
let snapshot = getPageSizes();

const emitChanges = () => {
  for (const listener of listeners) {
    listener();
  }
};

function subscribe(listener: () => void) {
  const resizeHandler = () => {
    const newSizes = getPageSizes();

    if (
      newSizes.screenX !== snapshot.screenX ||
      newSizes.screenY !== snapshot.screenY ||
      newSizes.browserWindowX !== snapshot.browserWindowX ||
      newSizes.browserWindowY !== snapshot.browserWindowY
    ) {
      snapshot = newSizes;
      emitChanges();
    }
  };
  let intervalId: ReturnType<typeof setInterval>;

  if (listeners.size === 0) {
    window.addEventListener("resize", resizeHandler);
    intervalId = setInterval(resizeHandler, 500);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("resize", resizeHandler);
      clearInterval(intervalId);
    }
  };
}

function getSnapshot() {
  return snapshot;
}

export function Login() {
  const pageSizeObject = useSyncExternalStore(subscribe, getSnapshot);
  const { isOpen: isPasswordVisible, toggle: togglePasswordVisibility } =
    useToggle(false);
  const route = useRouter();
  const setAccessToken = accessTokenStore.getState().setAccessToken;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginUserRequest>();
  const { mutate, isPending } = useMutation({
    ...loginUserMutation({
      credentials: "include",
    }),
    onSuccess: async (accessToken) => {
      Logger.info(`Login successful, access token:`, accessToken);
      setAccessToken(accessToken);

      route.navigate({
        to: "/dashboard",
        replace: true,
      });
    },
    onError: (error) => {
      Logger.info(`Login failed`, error);

      switch (error.status) {
        case 401: {
          setError("root.server-unauthorized", {
            type: String(error.status),
            message: String(error.detail),
          });
          break;
        }
        case 409: {
          setError("root.server-conflict", {
            type: String(error.status),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error("Unexpected server error in Login component", error);
        }
      }
    },
  });

  const onSubmit = handleSubmit(
    (data) => {
      mutate({
        body: data,
      });
    },
    (error) => {
      Logger.error("Submission failed", error);
    },
  );

  const onGoogleLogin = () => {
    const newUrl = URL.parse(import.meta.env.VITE_GOOGLE_LOGIN_URL);

    if (newUrl === null) {
      Logger.error(
        `Invalid URL passed as argument to URL.${URL.parse.name}, cannot `,
      );
      return;
    }
    const popupLeft =
      pageSizeObject.screenX +
      (pageSizeObject.browserWindowX - pageSizeObject.popupWidth) / 2;
    const popupTop =
      pageSizeObject.screenY +
      (pageSizeObject.browserWindowY - pageSizeObject.popupHeight) / 2;

    window.open(
      newUrl,
      "_blank",
      `popup=true, width=${pageSizeObject.popupWidth}, height=${pageSizeObject.popupHeight}; left=${popupLeft}, top=${popupTop}`,
    );
  };

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <h1>Login</h1>
      <label
        className={styles["field-label"]}
        htmlFor="email"
        data-testid="email"
      >
        <span>Email</span>
        <input
          className={styles["field-input"]}
          {...register("email", {
            required: { value: true, message: "Email is required" },
          })}
          id="email"
        />
        <span className={styles["field-error"]} data-testid="error">
          {errors.email?.message}
        </span>
        <span className={styles["field-error"]} data-testid="server-conflict">
          {errors.root?.["server-conflict"]?.message}
        </span>
      </label>
      <label
        className={styles["field-label"]}
        htmlFor="password"
        data-testid="password"
      >
        <span>Password</span>
        <div className={styles["field-group"]}>
          <input
            className={styles["field-input"]}
            {...register("password", {
              required: {
                value: true,
                message: "Password is required",
              },
              minLength: {
                value: 8,
                message: "Password too short, must be at least 8 characters",
              },
            })}
            type={isPasswordVisible ? "text" : "password"}
            id="password"
          />
          <Button variant="icon" size="icon" onClick={togglePasswordVisibility}>
            <IconEye />
          </Button>
        </div>
        <span className={styles["field-error"]} data-testid="error">
          {errors.password?.message}
        </span>
        <span
          className={styles["field-error"]}
          data-testid="server-unauthorized"
        >
          {errors.root?.["server-unauthorized"]?.message}
        </span>
      </label>
      <Button
        type="submit"
        variant="cta-primary"
        disabled={isPending}
        data-testid="normal-login"
      >
        Login
      </Button>
      <Button
        type="button"
        variant="cta-primary"
        disabled={isPending}
        onClick={onGoogleLogin}
        data-testid="google-login"
      >
        Login with Google
      </Button>
      <p className={styles["cta-link"]}>
        Need to create an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}

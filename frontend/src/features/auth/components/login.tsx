import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import styles from "./login.module.css";
import { IconEye } from "#frontend/assets/icons/icons";
import { Logger } from "#frontend/shared/app/logging";
import type { LoginUserRequest } from "#frontend/shared/client";
import { postApiAuthLoginMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
import { useToggle } from "#frontend/shared/hooks/use-toggle";
import { Button } from "#frontend/shared/primitives/button";
import { accessTokenStore } from "#frontend/shared/store/access-token";

export function Login() {
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
    ...postApiAuthLoginMutation({
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
      <Button type="submit" variant="login" disabled={isPending}>
        Login
      </Button>
      <p className={styles["cta-link"]}>
        Need to create an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}

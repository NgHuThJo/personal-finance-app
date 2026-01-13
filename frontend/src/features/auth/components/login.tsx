import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import styles from "./login.module.css";
import { Logger } from "#frontend/shared/app/logging";
import type { LoginUserRequest } from "#frontend/shared/client";
import { postApiAuthLoginMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";

export function Login() {
  const route = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginUserRequest>();
  const { mutate } = useMutation({
    ...postApiAuthLoginMutation(),
    onSuccess: async (data) => {
      Logger.info(`Login successful`, data);
      route.navigate({
        to: "/dashboard",
      });
    },
    onError: (error) => {
      Logger.info(`Login failed`, error);
      setError("email", {
        type: "400",
        message: error,
      });
    },
  });

  const onSubmit = handleSubmit(
    (data) => {
      console.table(data);

      mutate({
        body: data,
      });
    },
    (error) => {
      console.table(error);
    },
  );

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <h1>Login</h1>
      <label htmlFor="email">
        <span>Email</span>
        <input
          {...register("email", {
            required: { value: true, message: "Email is required" },
          })}
          id="email"
        />
        <p className={styles.error}>{errors.email?.message}</p>
      </label>
      <label htmlFor="password">
        <span>Password</span>
        <input
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
          id="password"
        />
        <p className={styles.error}>{errors.password?.message}</p>
      </label>
      <Button type="submit" variant="login">
        Login
      </Button>
      <p>
        Need to create an account? <Link to="/signup">Sign up</Link>
      </p>
    </form>
  );
}

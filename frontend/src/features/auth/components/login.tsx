import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import styles from "./login.module.css";
import type { LoginUserRequest } from "#frontend/shared/client";
import { postApiAuthLoginMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
import { Button } from "#frontend/shared/primitives/button";

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginUserRequest>();
  const { mutate } = useMutation({
    ...postApiAuthLoginMutation,
    onSuccess: async () => {},
    onError: (error) => {},
  });

  const onSubmit = handleSubmit(
    (data) => {
      console.table(data);

      mutate(data);
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

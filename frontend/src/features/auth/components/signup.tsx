import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import styles from "./signup.module.css";
import { IconEye } from "#frontend/assets/icons/icons";
import { postApiAuthSignupMutation } from "#frontend/shared/client/@tanstack/react-query.gen";
import type { SignUpUserRequest } from "#frontend/shared/client/types.gen";
import { useToggle } from "#frontend/shared/hooks/use-toggle";
import { Button } from "#frontend/shared/primitives/button";

export function Signup() {
  const route = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignUpUserRequest>();
  const { isOpen: isPasswordVisible, toggle: togglePasswordVisibility } =
    useToggle(false);
  const { mutate } = useMutation({
    ...postApiAuthSignupMutation(),
    onSuccess: () => {
      route.navigate({
        to: "/login",
      });
    },
    onError: (error) => {
      setError("root.server", {
        type: "409",
        message: error,
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.table(data);

    mutate({
      body: data,
    });
  });

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <h1>Sign up</h1>
      <label htmlFor="name">
        <span>Name</span>
        <input
          {...register("name", {
            required: {
              value: true,
              message: "Name is required",
            },
          })}
          id="name"
        />
        <span className={styles.error}>{errors.name?.message}</span>
      </label>
      <label htmlFor="email">
        <span>Email address</span>
        <input
          {...register("email", {
            required: {
              value: true,
              message: "Email address is required",
            },
          })}
          id="email"
        />
        <span className={styles.error}>{errors.email?.message}</span>
        <span className={styles.error}>{errors["root"]?.server?.message}</span>
      </label>
      <label htmlFor="password">
        <span>Password</span>
        <div className={styles.stack}>
          <input
            {...register("password", {
              required: {
                value: true,
                message: "Password is required",
              },
              minLength: {
                value: 8,
                message: "Password is too short, must be at least 8 characters",
              },
            })}
            type={isPasswordVisible ? "text" : "password"}
            id="password"
          />
          <Button size="icon" onClick={togglePasswordVisibility}>
            <IconEye />
          </Button>
        </div>
        <span className={styles.error}>{errors.password?.message}</span>
      </label>
      <Button type="submit" variant="login">
        Create Account
      </Button>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}

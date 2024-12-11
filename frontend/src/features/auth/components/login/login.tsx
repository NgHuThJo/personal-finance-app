import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "#frontend/providers/auth-context";
import { Button } from "#frontend/components/ui/button/button";
import { FormError } from "#frontend/components/ui/form/error/error";
import { Input } from "#frontend/components/ui/form/input/input";
import { trpc } from "#frontend/lib/trpc";
import { authSchema, AuthSchemaError } from "#frontend/types/zod";
import styles from "./login.module.css";

export function Login() {
  const [fieldErrors, setFieldErrors] = useState<AuthSchemaError>({});
  const login = trpc.auth.loginUser.useMutation();
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.loginUser);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const parsedData = authSchema.safeParse(formData);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    login.mutate(parsedData.data, {
      onSuccess: (data) => {
        if (data) {
          loginUser(data.id);
          console.log("Success loggging in:", data.id);
          navigate("/app");
        }
      },
      onError: (error) => {
        console.error("Backend error:", error.message);
      },
      onSettled: () => {
        setFieldErrors({});
      },
    });
  };

  if (login.isPending) {
    return <p>Loading...</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleLogin} noValidate>
      <h1>Login</h1>
      <Input
        type="email"
        label="Email"
        name="email"
        placeholder="Email"
        error={fieldErrors.email}
      />
      <Input
        type="text"
        minLength={8}
        label="Password"
        name="password"
        placeholder="Password"
        error={fieldErrors.password}
      />
      <Button type="submit" className="auth">
        Login
      </Button>
      <p>
        Need an account? <Link to="/register">Sign up here</Link>
      </p>
      {login.isError && <FormError message={login.error.message} />}
    </form>
  );
}

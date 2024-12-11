import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "#frontend/components/ui/button/button";
import { FormError } from "#frontend/components/ui/form/error/error";
import { Input } from "#frontend/components/ui/form/input/input";
import { trpc } from "#frontend/lib/trpc";
import {
  registrationSchema,
  RegistrationSchemaError,
} from "#frontend/types/zod";
import styles from "./registration.module.css";

export function Registration() {
  const [fieldErrors, setFieldErrors] = useState<RegistrationSchemaError>({});
  const registration = trpc.user.registerUser.useMutation();

  const handleRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const parsedData = registrationSchema.safeParse(formData);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    registration.mutate(parsedData.data, {
      onSuccess: (data) => {
        console.log("Registration successful:", data);
      },
      onError: (error) => {
        console.error("Backend error:", error.message);
      },
      onSettled: () => {
        setFieldErrors({});
      },
    });
  };

  if (registration.isPending) {
    return <p>Loading...</p>;
  }

  return (
    <form className={styles.form} onSubmit={handleRegistration} noValidate>
      <h1>Registration</h1>
      <Input
        type="text"
        name="firstName"
        label="First Name"
        placeholder="First Name"
        error={fieldErrors.firstName}
      />
      <Input
        type="text"
        name="lastName"
        label="Last Name"
        placeholder="Last Name"
        error={fieldErrors.lastName}
      />
      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Email"
        error={fieldErrors.email}
      />
      <Input
        type="text"
        name="password"
        label="Password"
        placeholder="Password"
        error={fieldErrors.password}
      />
      <Button type="submit" className="auth">
        Create Account
      </Button>
      <p>
        Already have an account? <Link to="/">Log in</Link>
      </p>
      {registration.isError && (
        <FormError message={registration.error.message} />
      )}
      {registration.isSuccess && (
        <p className={styles["success-message"]}>Registration successful!</p>
      )}
    </form>
  );
}

import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "#frontend/components/ui/button/button";
import { FormError } from "#frontend/components/ui/form/error/error";
import { Input } from "#frontend/components/ui/form/input/input";
import { trpc } from "#frontend/lib/trpc/trpc";
import { registrationSchema } from "#frontend/types/zod";
import styles from "./registration.module.css";

export function Registration() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const registration = trpc.user.registerUser.useMutation();

  console.log(registration);

  const handleRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    const parsedData = registrationSchema.safeParse(formData);

    if (!parsedData.success) {
      setFieldErrors(parsedData.error.flatten().fieldErrors);
      return;
    }

    registration.mutate(parsedData.data, {
      onError: (error) => {
        console.log("Backend error", error);
      },
      onSettled: (data) => {
        console.log("Registration finished", data);
      },
    });
  };

  if (registration.isPending) {
    return <p>Loading...</p>;
  }

  return (
    <form action="" className={styles.form} onSubmit={handleRegistration}>
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
      <Button type="submit">Create Account</Button>
      <p>
        Already have an account? <Link to="/">Log in</Link>
      </p>
      {registration.isError && (
        <FormError message={registration.error.message} />
      )}
    </form>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "#frontend/components/ui/button/button";
import { Input } from "#frontend/components/ui/form/input/input";
import styles from "./login.module.css";

export function Login() {
  return (
    <form className={styles.form}>
      <h1>Login</h1>
      <Input type="email" label="Email" placeholder="Email" />
      <Input
        type="text"
        minLength={8}
        label="Password"
        placeholder="Password"
      />
      <Button type="submit" className="auth">
        Login
      </Button>
      <p>
        Need an account? <Link to="/register">Sign up here</Link>
      </p>
    </form>
  );
}

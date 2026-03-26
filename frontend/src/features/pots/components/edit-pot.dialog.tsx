import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import styles from "./add-pot-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type {
  CreatePotRequest,
  GetAllPotsResponse,
} from "#frontend/shared/client";
import {
  createPotMutation,
  getAllPotsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
import { zCreatePotRequest } from "#frontend/shared/client/zod.gen";
import { Button } from "#frontend/shared/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "#frontend/shared/primitives/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
} from "#frontend/shared/primitives/field";
import { Input } from "#frontend/shared/primitives/input";
import { makeZodErrorsUserFriendly } from "#frontend/shared/utils/zod";

type EditPotDialogProps = {
  potData: GetAllPotsResponse;
};

export function EditPotDialog({
  potData: { id, name, target, total },
}: EditPotDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePotRequest>({
    defaultValues: {},
  });
  const { mutate } = useMutation({
    ...createPotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: async () => {
      Logger.info("Money successfully withdrawn from pot");
      await queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      setOpen(false);
    },
    onError: (error) => {
      Logger.error("Pot could not be created", error);

      switch (error.status) {
        case 400: {
          setError(`root.server-bad-request`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        case 409: {
          setError(`root.server-conflict`, {
            type: String(error.type),
            message: String(error.detail),
          });
          break;
        }
        default: {
          Logger.error(`Unknown error in ${EditPotDialog.name}`);
        }
      }
    },
  });

  const handleAddPotSubmit = handleSubmit((data) => {
    const convertedData: CreatePotRequest = {
      name: data.name,
      target: data.target,
    };

    const validationResult = zCreatePotRequest.safeParse(convertedData, {
      error: (iss) => {
        if (iss.code === "invalid_type") {
          return `Invalid type, expected ${iss.expected}`;
        }
        if (iss.code === "too_small") {
          return `Minimum is ${iss.minimum}`;
        }
      },
    });

    if (!validationResult.success) {
      const userFriendlyErrors = makeZodErrorsUserFriendly(
        validationResult.error,
      );

      for (const error in userFriendlyErrors) {
        const convertedError = error as keyof typeof userFriendlyErrors;

        userFriendlyErrors[convertedError].forEach((errorMessage) => {
          setError(convertedError, {
            message: errorMessage,
          });
        });
      }
    }

    mutate({
      body: convertedData,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="cta-primary">
          Edit Pot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Pot</DialogTitle>
        <DialogDescription>
          If your saving targets change, feel free to update your pots.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddPotSubmit}>
          <Field>
            <FieldLabel htmlFor="name">Pot Name</FieldLabel>
            <Input
              type="text"
              id="name"
              placeholder="e.g. Rainy Days"
              {...register("name", {
                required: "Pot name required",
              })}
            />
            {errors.name && <FieldError>{errors.name?.message}</FieldError>}
            {errors.root?.["server-conflict"] && (
              <FieldError>{errors.root["server-conflict"].message}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="target">Target Amount</FieldLabel>
            <Input
              type="number"
              step="any"
              id="target"
              placeholder="$ e.g. 2000"
              {...register("target", {
                valueAsNumber: true,
                required: "Target amount required",
                min: {
                  value: 0.01,
                  message: "Minimum of 0.01",
                },
              })}
            />
            {errors.target && <FieldError>{errors.target?.message}</FieldError>}
            {errors.root?.["server-bad-request"] && (
              <FieldError>
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
          </Field>
          <Button type="submit" variant="cta-primary">
            +Add New Pot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

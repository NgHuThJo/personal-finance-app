import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import styles from "./add-pot-dialog.module.css";
import { clientWithAuth } from "#frontend/shared/api/client";
import { Logger } from "#frontend/shared/app/logging";
import type { CreatePotRequest } from "#frontend/shared/client";
import {
  createPotMutation,
  getAllPotsOptions,
  getAllPotsQueryKey,
} from "#frontend/shared/client/@tanstack/react-query.gen";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#frontend/shared/primitives/select";
import { Spinner } from "#frontend/shared/primitives/spinner";
import { colorHexList } from "#frontend/shared/utils/color";

export function AddPotDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const {
    register,
    setError,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePotRequest>();
  const { data: potData } = useQuery({
    ...getAllPotsOptions({
      client: clientWithAuth,
      credentials: "include",
    }),
    enabled: false,
  });
  const { mutate, isPending } = useMutation({
    ...createPotMutation({
      client: clientWithAuth,
      credentials: "include",
    }),
    onSuccess: () => {
      Logger.info("Pot successfully created");
      queryClient.invalidateQueries({ queryKey: getAllPotsQueryKey() });
      setOpen(false);
      reset();
      toast.success("Pot successfully created");
    },
    onError: (error) => {
      toast.error(error.detail);
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
          Logger.error(`Unknown error in ${AddPotDialog.name}`);
        }
      }
    },
  });

  const themeColorSet = new Set(potData?.map((pot) => pot.themeColor));
  const convertedColorHexList = colorHexList.map((hexColor) => ({
    ...hexColor,
    available: themeColorSet.has(hexColor.key) ? false : true,
  }));
  const defaultValue = convertedColorHexList.find(
    (value) => value.available,
  )?.key;

  const handleAddPotSubmit = handleSubmit((data) => {
    const convertedData: CreatePotRequest = {
      name: data.name,
      target: data.target,
      themeColor: data.themeColor,
    };

    mutate({
      body: convertedData,
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="cta-primary">
          +Add New Pot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add New Pot</DialogTitle>
        <DialogDescription>
          Choose a category to set a spending budget. These categories can help
          you monitor spending.
        </DialogDescription>
        <form className={styles.dialog} onSubmit={handleAddPotSubmit}>
          <Field>
            <FieldLabel htmlFor="name">Pot Name</FieldLabel>
            <Input
              type="text"
              id="name"
              data-testid="name-error"
              placeholder="e.g. Rainy Days"
              {...register("name", {
                required: "Pot name required",
              })}
            />
            {errors.name && <FieldError>{errors.name?.message}</FieldError>}
            {errors.root?.["server-conflict"] && (
              <FieldError data-testid="add-pot-server-conflict">
                {errors.root["server-conflict"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="target">Target Amount</FieldLabel>
            <Input
              type="number"
              step="any"
              id="target"
              data-testid="target-error"
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
              <FieldError data-testid="add-pot-server-bad-request">
                {errors.root["server-bad-request"].message}
              </FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="theme-color">Theme</FieldLabel>
            <Controller
              name="themeColor"
              defaultValue={defaultValue}
              control={control}
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="theme-color">
                      <SelectValue placeholder="Select a theme color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {convertedColorHexList?.map(
                          ({ key, value, available }) => (
                            <SelectItem
                              value={key}
                              key={key}
                              disabled={!available}
                            >
                              <div className={styles["theme"]}>
                                <span
                                  className={styles["theme-circle"]}
                                  style={{
                                    "--color-theme-circle": `${value}`,
                                  }}
                                />
                                <span>
                                  {key}&nbsp;
                                  {`${!available ? "(Already in use)" : ""}`}
                                </span>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.themeColor && (
                    <FieldError>{errors.themeColor?.message}</FieldError>
                  )}
                </>
              )}
            ></Controller>
          </Field>
          <Button type="submit" variant="cta-primary" disabled={isPending}>
            {isPending ? <Spinner /> : "+Add New Pot"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  Snackbar,
  useSnackbar,
  Topbar,
  getStrokeColor,
  responsive,
  getGap,
  getPadding,
  shadow,
  getRadius,
  breakpoint,
} from "@wings-corporation/phoenix-ui";
import { Box, Container, Grid2, Stack } from "@mui/material";
import type { MYardConfigsap } from "@/types/yard-configsaps";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@bprogress/next"
import axios, { AxiosError } from "axios";
import type { Response } from "@/types/api"
import { usePathname } from "next/navigation"

const formSchema = z.object({      yardId: z.number({ message: 'Field is required' }),host: z.string().nonempty({ message: 'Field is required' }).max(15, 'Max length is 15 characters'),client: z.string().nonempty({ message: 'Field is required' }).max(3, 'Max length is 3 characters'),systemNumber: z.string().nonempty({ message: 'Field is required' }).max(2, 'Max length is 2 characters'),systemId: z.string().nonempty({ message: 'Field is required' }).max(3, 'Max length is 3 characters'),username: z.string().nonempty({ message: 'Field is required' }).max(12, 'Max length is 12 characters'),password: z.string().nonempty({ message: 'Field is required' }).max(100, 'Max length is 100 characters'),lang: z.string().nonempty({ message: 'Field is required' }).max(2, 'Max length is 2 characters'),    });

type FormError = {
  [key in keyof z.infer<typeof formSchema>]?: {
    _errors: string[];
  };
};

interface PageProps {
	action: "create" | "update"
	data: MYardConfigsap | null
  yardIdOptions: {value: string | number; label: string}[] 

}

export default function Page({
  action,
  data,
  yardIdOptions
}: PageProps) {
  const [errors, setErrors] = useState<FormError | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({yardId:data?.yardId || 0,host:data?.host || '',client:data?.client || '',systemNumber:data?.systemNumber || '',systemId:data?.systemId || '',username:data?.username || '',password:data?.password || '',lang:data?.lang || ''});
  const { triggerSnackbar } = useSnackbar()
  const searchParams = useSearchParams();
  const router = useRouter()
  const pathname = usePathname();
  const redirect = pathname.split("/").slice(0, -1).join("/");
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  function handleFormChange(key: keyof typeof form, value: string | number) {
    const updatedForm = { ...form, [key]: value };
    setIsSubmitted(true);
    if (isSubmitted) {
      const result = formSchema.safeParse(updatedForm);
      if (!result.success) {
        const errors = result.error.format() as FormError;
        setErrors(errors);
      } else {
        setErrors(null);
      }
    }
    setForm(updatedForm);
  }

  function onSubmit() {
    setIsSubmitted(true);
    const result = formSchema.safeParse(form);
    if (!result.success) {
      const errors = result.error.format() as FormError;
      setErrors(errors);
      return;
    }

    const id = searchParams.get("id");
    setIsLoading(true)
    if (action === "update" && id) {
      axios
        .put<Response<null, string>>(`/yard-management-system/api/yard-configsaps/${atob(id)}`, form)
        .then((r) => {
          triggerSnackbar({ message: r.data.message, emoji: "sparkles" })
          setTimeout(() => {
						router.push(redirect)
					}, 4000)
        })
			  .catch((err: AxiosError<{ message: string }>) => triggerSnackbar({ message: err.response!.data.message, emoji: "police-car-light" }))
        .finally(() => setIsLoading(false))
    } else {
      const data = {
        data: [form],
      };
      axios
        .post<Response<null, string>>("/yard-management-system/api/yard-configsaps", data)
        .then((r) => {
          triggerSnackbar({ message: r.data.message, emoji: "sparkles" })
          setTimeout(() => {
						router.push(redirect)
					}, 4000)
        })
			  .catch((err: AxiosError<{ message: string }>) => triggerSnackbar({ message: err.response!.data.message, emoji: "police-car-light" }))
        .finally(() => setIsLoading(false))
    }
  }

  return (
    <>
      {isMounted && (<Topbar
        topBarDefault={false}
        slotProps={{
          submitButton: {
            isLoading: isLoading,
            onClick: () => onSubmit(),
          },
          cancelButton: {
            onClick: () => router.back(),
          }
        }}
      />)}
      <Stack
        sx={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          sx={{
            width: "100%",
            [breakpoint.desktop]: {
              width: "calc(100% / 2)",
            },
          }}
        >
          <Box
            sx={{
              border: `0.5px solid ${getStrokeColor("neutral")}`,
              boxShadow: shadow.sm,
              ...responsive({
                attribute: "borderRadius",
                getter: getRadius,
                preset: "lg",
              }),
            }}
          >
            <Stack>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  ...responsive({
                    attribute: "padding",
                    getter: getPadding,
                    preset: "lg",
                  }),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    ...responsive({
                      attribute: "gap",
                      getter: getGap,
                      preset: "md",
                    }),
                  }}
                >
                  <Select
                  fullWidth
                  label="Yard Code"
                  error={errors?.yardId && errors.yardId._errors?.length > 0}
                  helperText={errors?.yardId?._errors?.join(", ")}
                  name="yardId"
                  value={form.yardId}
                  onChange={(ev) => handleFormChange("yardId", ev.target.value as string)}
                >
                  {yardIdOptions?.map((item, idx) => (
                      <MenuItem key={idx} value={item.value}>{item.label}</MenuItem>
                  ))}
                </Select><TextField
            fullWidth
            label="Host"
            name="host"
            type="text"
            defaultValue={form.host}
            onBlur={(ev) => handleFormChange("host", ev.target.value)}
            error={errors?.host && errors.host._errors?.length > 0}
            helperText={errors?.host?._errors?.join(", ")}
          /><TextField
            fullWidth
            label="Client"
            name="client"
            type="text"
            defaultValue={form.client}
            onBlur={(ev) => handleFormChange("client", ev.target.value)}
            error={errors?.client && errors.client._errors?.length > 0}
            helperText={errors?.client?._errors?.join(", ")}
          /><TextField
            fullWidth
            label="System Number"
            name="systemNumber"
            type="text"
            defaultValue={form.systemNumber}
            onBlur={(ev) => handleFormChange("systemNumber", ev.target.value)}
            error={errors?.systemNumber && errors.systemNumber._errors?.length > 0}
            helperText={errors?.systemNumber?._errors?.join(", ")}
          /><TextField
            fullWidth
            label="System Id"
            name="systemId"
            type="text"
            defaultValue={form.systemId}
            onBlur={(ev) => handleFormChange("systemId", ev.target.value)}
            error={errors?.systemId && errors.systemId._errors?.length > 0}
            helperText={errors?.systemId?._errors?.join(", ")}
          /><TextField
            fullWidth
            label="Username"
            name="username"
            type="text"
            defaultValue={form.username}
            onBlur={(ev) => handleFormChange("username", ev.target.value)}
            error={errors?.username && errors.username._errors?.length > 0}
            helperText={errors?.username?._errors?.join(", ")}
          /><TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            defaultValue={form.password}
            onBlur={(ev) => handleFormChange("password", ev.target.value)}
            error={errors?.password && errors.password._errors?.length > 0}
            helperText={errors?.password?._errors?.join(", ")}
          /><TextField
            fullWidth
            label="Lang"
            name="lang"
            type="text"
            defaultValue={form.lang}
            onBlur={(ev) => handleFormChange("lang", ev.target.value)}
            error={errors?.lang && errors.lang._errors?.length > 0}
            helperText={errors?.lang?._errors?.join(", ")}
          />
                </Box>
              </Box>
            </Stack>
          </Box>
          <Snackbar variant="neutral" />
        </Stack>
      </Stack>
    </>
  );
}

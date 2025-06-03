"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { ArrowLeft, Info, User } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email Wajib diisi" })
    .email("Email tidak valid"),
  password: z
    .string()
    .min(8, { message: "Password harus terdiri dari minimal 8 karakter" })
    .nonempty({ message: "Password wajib diisi" }),
});

// Demo accounts
const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@gmail.com",
    password: "password",
    description: "Full access to dashboard",
  },
  {
    role: "User",
    email: "hpsgaming212@gmail.com",
    password: "password",
    description: "Standard user access",
  },
];

interface LoginResponse {
  data: {
    id: number;
    name: string;
    address: string;
    role: string;
  };
  access_token: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const setCookie = (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
  };

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Replace with your actual API URL
      const API_URL =
        process.env.NEXT_PUBLIC_HOST_API || "http://localhost:3001";

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data: LoginResponse = await response.json();

      // Set token in cookie
      setCookie("access_token", data.access_token);

      // Show success message
      toast.success(`Welcome back, ${data.data.name}!`);

      // Redirect to dashboard
      if (data.data.role.toLocaleLowerCase() === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/products");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login gagal. Periksa email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Demo Account Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold">Demo Accounts</p>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              {DEMO_ACCOUNTS.map((account, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 bg-muted/50 rounded"
                >
                  <div className="flex-1">
                    <span className="font-medium text-primary">
                      {account.role}:
                    </span>
                    <div className="text-xs text-muted-foreground mt-1">
                      <div>Email: {account.email}</div>
                      <div>Password: {account.password}</div>
                      <div>{account.description}</div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDemoLogin(account.email, account.password)
                    }
                    className="text-xs"
                  >
                    Use {account.role}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Hi, Welcome back</CardTitle>
          <CardDescription>
            More effectively with optimized workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <User />
            <AlertTitle>Use demo Account with credentials above</AlertTitle>
            <AlertDescription>
              Manage your products if you're Admin and order here if you User
            </AlertDescription>
          </Alert>
          <form
            onSubmit={form.handleSubmit(handleLogin)}
            noValidate
            className="mt-5"
          >
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...form.register("email")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.email && (
                    <span className="text-red-500 text-sm">
                      {form.formState.errors.email?.message}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...form.register("password")}
                    disabled={isLoading}
                  />
                  {form.formState.errors.password && (
                    <span className="text-red-500 text-sm">
                      {form.formState.errors.password?.message}
                    </span>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

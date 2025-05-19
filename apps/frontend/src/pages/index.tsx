"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/userContext";
import Container from "@/components/ui/Container";
import { UserLogin, UserCreate } from "@/schemas/User";

type LoginFormData = z.infer<typeof UserLogin>;
type RegisterFormData = z.infer<typeof UserCreate>;

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useUser();

  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isLogin ? UserLogin : UserCreate),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }

    async function fetchUsers() {
      try {
        const response = await fetch("/api/users/here");
        const data = await response.json();
        if (!data.hasUser) {
          setIsLogin(false);
        }
      } catch (error) {
        console.error("Error checking users:", error);
      }
      setLoading(false);
    }

    fetchUsers();
  }, [user, router]);

  const onSubmit = async (values: LoginFormData | RegisterFormData) => {
    setLoading(true);
    try {
      const response = await fetch(
        isLogin ? "/api/auth/login" : "/api/auth/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            {isLogin ? "Log In" : "Register"}
          </CardTitle>
          {!isLogin && (
            <p className="text-sm text-muted-foreground text-center">
              Create an admin account
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete={
                          isLogin ? "current-password" : "new-password"
                        }
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full relative"
                disabled={loading}
              >
                {loading ? (
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="w-5 h-5 border-4 border-t-4 border-foreground border-t-ring rounded-full animate-spin"></div>
                  </div>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home;

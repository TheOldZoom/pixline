import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { validateSchema } from "@/lib/utils";
import { UserCreate, UserLogin } from "@/schemas/User";

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const name = nameRef.current?.value || "";
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";

    const formData = { name, email, password };
    const schema = isLogin ? UserLogin : UserCreate;

    const result = validateSchema(formData, schema);

    if (!result.success) {
      const newErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const validatedData = result.data;
    console.log("Validated data:", validatedData);

    try {
      const response = await fetch(
        isLogin ? "/api/auth/login" : "/api/auth/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validatedData),
        }
      );

      const data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      if (localStorage.getItem("token")) {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (errors[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[field];
      setErrors(updatedErrors);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }

    async function fetchUsers() {
      try {
        const response = await fetch("/api/users/here");
        const data = await response.json();
        if (!data.hasUser) {
          setIsLogin(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "Login" : "Register"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  ref={nameRef}
                  autoComplete="name"
                  className={errors.name ? "border-destructive" : ""}
                  onChange={(e) => handleInputChange(e, "name")}
                />
                <div className="min-h-[1.25rem]">
                  {errors.name && (
                    <p className="text-destructive text-sm  ">{errors.name}</p>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                ref={emailRef}
                autoComplete="email"
                className={errors.email ? "border-destructive" : ""}
                onChange={(e) => handleInputChange(e, "email")}
              />
              <div className="min-h-[1.25rem]">
                {errors.email && (
                  <p className="text-destructive text-sm  ">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                ref={passwordRef}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={errors.password ? "border-destructive" : ""}
                onChange={(e) => handleInputChange(e, "password")}
              />
              <div className="min-h-[1.25rem]">
                {errors.password && (
                  <p className="text-destructive text-sm ">{errors.password}</p>
                )}
              </div>
            </div>

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
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;

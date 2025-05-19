import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/ui/Container";
import Link from "next/link";
import React from "react";

function _404() {
  return (
    <Container className="flex flex-1 items-center justify-center h-full">
      <Card className="w-full max-w-md p-8">
        <CardContent className="flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold mb-4">404</h1>
          <p className="text-center text-muted-foreground text-lg">
            Page Not Found
          </p>
          <Button className="mt-6" variant="default" asChild>
            <Link href="/dashboard">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default _404;

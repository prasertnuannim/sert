"use client";

import { useActionState } from "react";
import { useEffect, startTransition } from "react";
import { getLoginEvents } from "./actions";
import LoginMap from "./Map";
import { LoginEvent } from "@prisma/client";
import Loading from "@/components/form/Loading";

export default function LoginMapPage() {
  const [events, fetchEvents, isPending] = useActionState<LoginEvent[]>(getLoginEvents, []);

  useEffect(() => {
    startTransition(() => {
      fetchEvents();
    });
  }, [fetchEvents]);

  if (isPending) return <Loading/>
  return <LoginMap events={events} />;
}

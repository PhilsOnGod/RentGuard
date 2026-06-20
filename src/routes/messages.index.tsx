import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/messages/")({
  component: () => (
    <div className="h-full grid place-items-center text-center p-10 text-sm text-muted-foreground">
      <div>
        <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50" />
        <p className="mt-3">Select a conversation to start chatting.</p>
      </div>
    </div>
  ),
});

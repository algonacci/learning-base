import { useState } from "react";

type Messages = { role: "system" | "user" | "assistant"; content: string }[];

export default function Home() {
  const [messages, setMessages] = useState<Messages>([
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
  ]);
  return (
    <div>
      <div className="container mx-auto pt-12">
        <div className="prose">
          {messages?.map((message, index) => (
            <p key={index}>
              <em>{message.role}</em>: {message.content}
            </p>
          ))}
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = Object.fromEntries(formData.entries());
            setMessages((messages: Messages) => [
              ...messages,
              {
                role: "user",
                ...(data as { content: string }),
              },
            ]);
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer sk-",
              },
              body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                  {
                    role: "system",
                    content: "You are a helpful assistant.",
                  },
                  {
                    role: "user",
                    ...data,
                  },
                ],
              }),
            });
            const json = await response.json();
            setMessages((messages: Messages) => [
              ...messages,
              {
                role: "assistant",
                content: json.choices[0].message.content,
              },
            ]);
          }}
        >
          <div className="form-control">
            <label>
              <span className="label-text">Content</span>
            </label>
            <textarea name="content" rows={3} className="textarea textarea-bordered" required></textarea>
          </div>
          <div className="form-control mt-4">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

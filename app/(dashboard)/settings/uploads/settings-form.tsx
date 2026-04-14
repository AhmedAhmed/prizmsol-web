"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ResultType {
  message?: string;
  success?: boolean;
  data?: any;
}

export default function SettingsForm({ user }: { user: any }) {
  const [result, setResult] = useState<ResultType>({});
  const [message, setMessage] = useState("");
  const [name, setName] = useState<string>(user.name);
  const [username, setUsername] = useState<string>(user.username);
  const [bio, setBio] = useState<string>(user.biography);
  const [submitted, setSubmitted] = useState(false);

  const checkUsername = async (username: string) => {
    const response = await fetch("/api/account/attempt/username", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    const json = await response.json();
    setResult(json);
  };

  const handleUsernameValueChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    const newValue = value.replace(/[^a-zA-Z\d]/, "");
    setUsername(newValue);
  };

  const handleUsernameBlur = async () => {
    if (username.toLowerCase() != user.username.toLowerCase()) {
      setMessage("");
      await checkUsername(username);
    } else {
      setResult({});
      setMessage("That's you!");
    }
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  const handleBioChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);
  };

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setSubmitted(true);
    const req = await fetch("/api/account/profile/update", {
      method: "POST",
      body: JSON.stringify({
        name,
        username,
        bio,
      }),
    });
    const response = await req.json();
    if (response.status == 200) {
      setSubmitted(false);
      toast.success("Successfully saved profile");
    } else {
      setSubmitted(false);
      toast.error("Could save profile.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 items-center justify-center w-full max-w-[500px] p-5"
    >
      {user.name == "" && (
        <div className="flex flex-col text-center py-2 px-5 text-yellow-900 border-yellow-800 bg-yellow-500 rounded-md">
          Finish setting up your account to use Glitchd. Enter your full name
          and username. You may also upload a profile picture.
        </div>
      )}
      <div className="flex flex-col gap-3 w-full">
        <Label htmlFor="name" className="text-lg">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          className="text-md"
          onChange={handleNameChange}
          value={name}
          defaultValue={user.name}
        />
      </div>
      <div className="flex flex-col gap-3 w-full">
        <Label htmlFor="username" className="text-lg">
          Username
        </Label>
        <Input
          onChange={handleUsernameValueChange}
          onBlur={handleUsernameBlur}
          id="username"
          name="username"
          className="text-md"
          autoComplete="off"
          value={username}
        />
        {result?.success == false && (
          <>
            <input type="hidden" name="username_error" value="true" />
            <span className="text-red-500 text-md font-semibold">
              Username is Taken
            </span>
          </>
        )}
        {result?.success == true && (
          <span className="text-green-500 text-md font-semibold">
            Username is Available
          </span>
        )}
        {message && (
          <span className="text-green-500 text-md font-semibold">
            {message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Label htmlFor="bio" className="text-lg">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={handleBioChange}
          className="text-md"
          placeholder="Share a little about yourself"
          defaultValue={user.biography}
        />
      </div>
      <Button
        disabled={submitted}
        className="w-full mt-2 text-white dark:text-white text-lg transition-all bg-gradient-to-r from-rose-600 to-purple-600 hover:scale-105 active:scale-95 py-6"
      >
        {!submitted ? (
          <span>Save & Continue</span>
        ) : (
          <Loader2 size={25} className="animate-spin" />
        )}
      </Button>
    </form>
  );
}

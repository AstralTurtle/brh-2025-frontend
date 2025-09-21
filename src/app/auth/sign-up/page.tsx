"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { FormEvent } from "react";
import NavBar from "@/components/NavigationBar";

export default function Page({ params }: { params: { slug: string } }) {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(event);

    const formData = new FormData(event.currentTarget);

    // 3. You can now access the data
    const username = formData.get('username');
    const password = formData.get('password');

    console.log('Username from FormData:', username);
    console.log('Password from FormData:', password);

    try {
      const response = await axios.post("http://127.0.0.1:8000/users/create", {
        username: username,
        display_name: "",
        summary: "",
        password: password,
        icon: ""
      });
      console.log(response);

      const data: { access_token: string } = response.data;

      // Set cookie with proper attributes
      document.cookie = `jwt=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      console.log('Cookie set:', document.cookie);

      // Redirect to feed after successful signup
      window.location.href = '/feed';
    } catch (error) {
      console.error('Signup failed:', error);
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <NavBar></NavBar>
        <div className="flex w-full flex-1 flex-col items-center p-4">
          <div className="flex flex-1 flex-col gap-4 rounded-xl bg-zinc-900 p-4">
            <div className="flex w-[630px] flex-col justify-center rounded-md border-2 border-slate-700">
              <Card className="text-white bg-zinc-800 w-full">
                <CardHeader>
                  <CardTitle>Sign up to your account</CardTitle>
                  <CardDescription>Join for free now!</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <label htmlFor="text">Username</label>
                        <input className="text-black" name="username" type="text" placeholder=" MyUsername" required />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="password">Password</label>
                        <input className="text-black" name="password" type="password" placeholder=" MyS3cureP@ssw0rd" required />
                      </div>
                      <button type="submit" className="w-full">
                        Sign up
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

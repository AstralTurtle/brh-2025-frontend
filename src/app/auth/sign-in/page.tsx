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
      const response = await axios.post("http://127.0.0.1:8000/users/login", {
        username: username,
        password: password
      });
      console.log(response);

      const data: { access_token: string } = response.data;

      // Set cookie with proper attributes
      document.cookie = `jwt=${data.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      console.log('Cookie set:', document.cookie);

      // Redirect to feed after successful login
      window.location.href = '/feed';
    } catch (error) {
      console.error('Login failed:', error);
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
                  <CardTitle>Sign in to your account</CardTitle>
                  <CardDescription>Thanks for contributing towards our platform!</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={onSubmit}>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-2">
                        <label htmlFor="text">Username</label>
                        <input className="border-2 border-slate-700 bg-zinc-800 p-2 rounded-md" name="username" type="text" placeholder="MyUsername" required />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="password">Password</label>
                        <input className="border-2 border-slate-700 bg-zinc-800 p-2 rounded-md" name="password" type="password" placeholder="MyS3cureP@ssw0rd" required />
                      </div>
                      <button type="submit" className="w-full">
                        Sign in
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

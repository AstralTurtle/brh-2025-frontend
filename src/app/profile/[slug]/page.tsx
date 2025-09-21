import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-violet-600 to-indigo-600">
        <div className="flex h-24 w-full items-center bg-transparent">
          <h1 className="mx-12 text-3xl font-bold italic text-white">placeholder</h1>
        </div>
        <div className="flex w-full flex-1 flex-col items-center p-4">
          <div className="flex w-[512px] flex-1 flex-col rounded-xl bg-zinc-900">
            <div className="flex w-full flex-row items-center p-6">
              <h1 className="mr-auto text-5xl font-bold text-white">warfarm</h1>
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://cdn.discordapp.com/avatars/460083959720706048/72e6aa5994b69e83dfc9186aa21e1f40" />
                <AvatarFallback></AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

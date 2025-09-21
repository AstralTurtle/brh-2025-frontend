import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Profile(props: { username: string; avatar: string; bio: string }) {
  return (
    <div className="flex w-[630px] flex-col gap-4 rounded-md border-2 border-slate-700 p-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={props.avatar} />
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <h1 className="text-5xl font-bold text-white">{props.username}</h1>
      <p className="font-normal text-slate-200">
        <b>611</b> followers
      </p>
      <h3 className="text-xl text-slate-200">{props.bio}</h3>
    </div>
  );
}

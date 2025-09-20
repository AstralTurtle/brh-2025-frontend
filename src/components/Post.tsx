import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

export function Post(props: { username: string; avatar: string; date: Date; message: string; media: string[] }) {
  return (
    <div className="flex w-[630px] flex-row gap-2 rounded-md border-2 border-slate-700 p-2">
      <div className="flex h-full">
        <Avatar className="h-16 w-16">
          <AvatarImage src={props.avatar} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-row gap-2">
          <h1 className="text-xl font-bold text-white">{props.username}</h1>
          <h2 className="text-xl font-normal text-slate-400">2h</h2>
        </div>

        <p className="text-lg font-normal text-white">{props.message}</p>

        {props.media.length > 0 ? (
          <Carousel className="my-2">
            <CarouselContent>
              {props.media.map((url: string, i: number) => {
                return (
                  <CarouselItem className="basis-2/3" key={i}>
                    <Image className="rounded-xl" src={url} alt="" />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

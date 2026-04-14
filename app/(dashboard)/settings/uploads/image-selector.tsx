"use client";

import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { handleImageUpdate } from "./action";
import { toast } from "sonner";

interface ImageSelectorProps {
  photo: string;
  name: string;
  className?: string;
}

export default function ImageSelector(props: ImageSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/files/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (_error) {
      toast.error("Failed to upload file, please try again!");
    }
  }, []);
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file: FileList | null = e.target.files;
    if (file) {
      const getUploadUrl = async (file: File) => {
        try {
          setIsUploading(true);
          const data = await uploadFile(file);
          if (data) {
            const { url } = data;
            setFileUrl(url);
            setIsUploading(false);
            setTimeout(() => {
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            }, 500);
          }
        } catch (e: any) {
          console.warn("uploadUrl Error: ", e);
        }
      };

      await getUploadUrl(file[0]);
    }
  };

  const triggerUpload = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const getInitials = () => {
    return (
      (props?.name || "NU")
        .split(" ")
        .map((n: any) => n[0])
        .join("") || ""
    );
  };

  const renderImage = () => {
    return props.photo ? (
      <Image
        src={props.photo}
        alt={props.name}
        fill
        className="object-fill h-40 w-40"
      />
    ) : (
      <span className="text-[4rem] font-bold">{getInitials()}</span>
    );
  };

  return (
    <form
      ref={formRef}
      action={handleImageUpdate}
      className="flex flex-col gap-5 items-center"
    >
      <input
        onChange={handlePhotoChange}
        ref={inputRef}
        type="file"
        accept="image/*"
        name="photo"
        className="hidden"
      />
      <input type="hidden" name="fileUrl" value={fileUrl} />
      <div
        className="flex relative group/photo h-40 w-40 cursor-pointer bg-neutral-300 dark:bg-neutral-800 rounded-full justify-center items-center overflow-hidden"
        onClick={triggerUpload}
      >
        <div className="hidden group-hover/photo:flex flex-col h-full w-full justify-center items-center bg-black/80 absolute left-0 right-0 top-0 bottom-0 z-20">
          <Camera size={30} />
        </div>
        {!isUploading && renderImage()}
        {isUploading && (
          <span className="flex flex-1 items-center justify-center">
            <Loader2 size={40} className="animate-spin" />
          </span>
        )}
      </div>
    </form>
  );
}

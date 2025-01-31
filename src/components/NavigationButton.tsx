"use client";

import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

interface NavigationButtonProps {
  path: string;
  text?: string;
  classes?: string
}

export default function NavigationButton({ path, text, classes }: NavigationButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(path)}
      className={`button absolute top-5 left-5 p-2 text-white bg-gray-800 rounded-full hover:bg-gray-600 transition ${classes}`}
    >
      {
        text ? text :
      
      <FaArrowLeft className="text-xl" />
      }
    </button>
  );
}
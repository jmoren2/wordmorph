"use client";

import NavigationButton from "@/components/NavigationButton";
import { capitalizeFirstLetter } from "@/utils/utils";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function App() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (session?.user) {
      axios.get(`/api/game/${session.user?.id}`).then((res) => {
        if (res.data) {
          setStreak(res.data.streak);
        }
      });
    }
  }, [session]);

  return (
    <div className="App">
      <div className="nes-box" style={{ maxWidth: "500px" }}>
        <h1>WordMorph</h1>

        {!session && (
          <p>
            WordMorph is a daily word puzzle game where the challenge evolves every day!
            Guess the secret word with a changing length, receive instant feedback on letter accuracy,
            and track your winning streak. Play, strategize, and morph your way to victory! 🚀🔠
          </p>
        )}

        {session ? (
          <>
            <p>Welcome back, {capitalizeFirstLetter(session.user?.name)}!</p>
            <p>Current streak: {streak}</p>
            <NavigationButton text="PLAY NOW" path="/wordmorph" />
            <p style={{ fontSize: 10 }}>signed in as: {session.user?.email}</p>
            <button className="secondary-button" onClick={() => signOut()}>Sign out</button>
          </>
        ) : (
          <div>
            <button className="button" onClick={() => signIn(undefined, { callbackUrl: "/wordmorph" })}>
              Sign in
            </button>
            <p>Don&apos;t have an account?</p>
            <NavigationButton text="SIGN UP" path="/signup" classes="nav-button" />
          </div>
        )}
      </div>
    </div>
  );
}

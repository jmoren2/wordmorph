"use client"

import NavigationButton from "@/components/NavigationButton";
import { signIn, signOut, useSession } from "next-auth/react";

export default function App() {
  const { data: session } = useSession();
  return (
    <>
      <div className="App">
        <div className="nes-box" style={{ maxWidth: '500px' }}>
          <h1>WordMorph</h1>
          <p>WordMorph is a daily word puzzle game where the challenge evolves every day!
            Guess the secret word with a changing length, receive instant feedback on letter accuracy,
            and track your winning streak. Play, strategize, and morph your way to victory! 🚀🔠
          </p>
          {
            session ?
              <>
                <NavigationButton text="PLAY NOW" path="/wordmorph" /><br />
                <p> Signed in as {session?.user?.email} <br />
                  {session?.user?.name} <br /></p>
                <button className="secondary-button" onClick={() => signOut()}>Sign out</button>
              </>

              :
              <div>
                Not signed in <br />
                <button className="button" onClick={() => signIn(undefined, { callbackUrl: "/wordmorph" })}>Sign in</button><br />
                <>
                  <br />
                  Don&apos;t have an account?
                  <br />
                  <NavigationButton text="SIGN UP" path="/signup" classes="nav-button" />
                </>
              </div>
          }
        </div>
      </div>
    </>
  );
};

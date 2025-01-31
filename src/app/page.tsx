"use client"

import NavigationButton from "@/components/NavigationButton";
import { signIn, signOut, useSession } from "next-auth/react";

// interface ServerSideProps {
//   session: Session | null;
// }
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
                <button className="signout-button" onClick={() => signOut()}>Sign out</button>
              </>

              :
              <>
                Not signed in <br />
                <button className="button" onClick={() => signIn(undefined, { callbackUrl: "/wordmorph" })}>Sign in</button>
              </>}
        </div>
      </div>
    </>
  );
};

import Login from "@/app/components/Login";
import Feed from "@/app/components/Feed";

export default function Home() {
    return (
        <>
            <h1>Podcast Hub UI</h1>
            <Login/>

            <h2>Meine Feeds</h2>
            <Feed/>
            <Feed/>
        </>
    );
}

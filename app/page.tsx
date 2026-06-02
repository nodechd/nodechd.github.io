import Image from "next/image";
import nodeLogo from "../assets/node-logo.png";

export default function Home() {
  return (
    <main className="home">
      <Image
        className="node-logo"
        src={nodeLogo}
        alt="Node logo"
        priority
      />
      <p>
        We are a community of builders creating knowledge around broad
        technical paradigms and open-source tools that meaningfully serve the
        broader community.
      </p>
    </main>
  );
}

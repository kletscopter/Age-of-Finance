import Head from "next/head";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import styles from "../styles/Home.module.css";
import StakeApp from "../components/StakeApp";
import Header from "../components/Header";
import bg from "../public/Age.jpg";

export default function Home() {
  return (
    <main
      className={styles.container}
      style={{
        backgroundImage: `url(${bg.src})`,
        width: "100%",
        height: "100vh",
      }}
    >
      <div>
        <Header>
          <title className={styles.title}>Age of Finance</title>
        </Header>
        <ConnectButton />
        <StakeApp />
      </div>
    </main>
  );
}

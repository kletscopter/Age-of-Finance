import { NotificationProvider } from "web3uikit";
import { ethers } from "ethers";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { chain, createClient, configureChains, WagmiConfig } from "wagmi";

const { chains, provider } = configureChains(
  [chain.goerli],
  [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Age of Finance",
  chains,
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} initialChain={chain.goerli} coolMode>
        <NotificationProvider>
          <Component {...pageProps} />
        </NotificationProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
